import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { OfferItem } from '../entities/offer-item.entity';
import { RepairSession } from '../entities/repair-session.entity';
import { CreateOfferInput, CreateOfferItemInput } from '../dto/repair.input';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(OfferItem)
    private offerItemRepository: Repository<OfferItem>,
    @InjectRepository(RepairSession)
    private repairSessionRepository: Repository<RepairSession>,
  ) {}

  async create(input: CreateOfferInput, businessId: number): Promise<Offer> {
    // Validate repair session exists and belongs to business
    const repairSession = await this.repairSessionRepository.findOne({
      where: { id: input.repairSessionId, business: { id: businessId } },
      relations: ['business'],
    });

    if (!repairSession) {
      throw new NotFoundException('Repair session not found');
    }

    const totalCost = input.laborCost + input.partsCost;
    const discountAmount = input.discountPercentage ? (totalCost * input.discountPercentage / 100) : 0;
    const finalCost = totalCost - discountAmount;

    const offer = this.offerRepository.create({
      ...input,
      repairSession,
      totalCost,
      discountAmount,
      finalAmount: finalCost,
      offerNumber: await this.generateOfferNumber(businessId),
    });

    return this.offerRepository.save(offer);
  }

  async addItem(offerId: number, input: CreateOfferItemInput, businessId: number): Promise<OfferItem> {
    // Validate offer exists and belongs to business
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, repairSession: { business: { id: businessId } } },
      relations: ['repairSession', 'repairSession.business'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const itemTotal = (input.laborHours * input.laborRate) + (input.quantity * input.unitPrice);

    const offerItem = this.offerItemRepository.create({
      ...input,
      offer,
      totalCost: itemTotal,
    });

    const savedItem = await this.offerItemRepository.save(offerItem);

    // Update offer totals
    await this.recalculateOfferTotals(offerId);

    return savedItem;
  }

  async findAll(businessId: number): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { repairSession: { business: { id: businessId } } },
      relations: ['repairSession', 'repairSession.car', 'repairSession.car.client', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, businessId: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id, repairSession: { business: { id: businessId } } },
      relations: [
        'repairSession',
        'repairSession.car',
        'repairSession.car.client',
        'items',
      ],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async approve(id: number, businessId: number): Promise<Offer> {
    const offer = await this.findOne(id, businessId);

    if (offer.isApproved) {
      throw new BadRequestException('Offer already approved');
    }

    if (new Date() > new Date(offer.validUntil)) {
      throw new BadRequestException('Offer has expired');
    }

    offer.isApproved = true;
    offer.approvedAt = new Date();
    offer.updatedAt = new Date();

    return this.offerRepository.save(offer);
  }

  async reject(id: number, businessId: number, reason?: string): Promise<Offer> {
    const offer = await this.findOne(id, businessId);

    if (offer.isApproved) {
      throw new BadRequestException('Cannot reject an approved offer');
    }

    offer.isRejected = true;
    offer.rejectedAt = new Date();
    if (reason) {
      offer.rejectionReason = reason;
    }
    offer.updatedAt = new Date();

    return this.offerRepository.save(offer);
  }

  async getStatistics(businessId: number): Promise<any> {
    const totalOffers = await this.offerRepository.count({
      where: { repairSession: { business: { id: businessId } } },
    });

    const approvedOffers = await this.offerRepository.count({
      where: { 
        repairSession: { business: { id: businessId } },
        isApproved: true,
      },
    });

    const rejectedOffers = await this.offerRepository.count({
      where: { 
        repairSession: { business: { id: businessId } },
        isRejected: true,
      },
    });

    const pendingOffers = totalOffers - approvedOffers - rejectedOffers;

    const totalRevenue = await this.offerRepository
      .createQueryBuilder('offer')
      .select('SUM(offer.finalAmount)', 'total')
      .innerJoin('offer.repairSession', 'session')
      .where('session.businessId = :businessId', { businessId })
      .andWhere('offer.isApproved = :approved', { approved: true })
      .getRawOne();

    return {
      totalOffers,
      approvedOffers,
      rejectedOffers,
      pendingOffers,
      approvalRate: totalOffers > 0 ? (approvedOffers / totalOffers * 100).toFixed(2) : 0,
      totalRevenue: totalRevenue.total || 0,
    };
  }

  private async recalculateOfferTotals(offerId: number): Promise<void> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['items'],
    });

    if (!offer) return;

    const laborCost = offer.items.reduce((sum, item) => sum + (item.laborHours * item.laborRate), 0);
    const partsCost = offer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalCost = laborCost + partsCost;
    const discountAmount = offer.discountPercentage ? (totalCost * offer.discountPercentage / 100) : 0;
    const finalAmount = totalCost - discountAmount;

    await this.offerRepository.update(offerId, {
      laborCost,
      partsCost,
      totalCost,
      discountAmount,
      finalAmount,
      updatedAt: new Date(),
    });
  }

  private async generateOfferNumber(businessId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.offerRepository.count({
      where: { 
        repairSession: { business: { id: businessId } },
        createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31))
      },
    });

    return `OFF-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}