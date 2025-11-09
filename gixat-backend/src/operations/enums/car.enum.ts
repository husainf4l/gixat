import { registerEnumType } from '@nestjs/graphql';

export enum CarMake {
  TOYOTA = 'toyota',
  HONDA = 'honda',
  FORD = 'ford',
  CHEVROLET = 'chevrolet',
  NISSAN = 'nissan',
  BMW = 'bmw',
  MERCEDES = 'mercedes',
  AUDI = 'audi',
  VOLKSWAGEN = 'volkswagen',
  HYUNDAI = 'hyundai',
  KIA = 'kia',
  MAZDA = 'mazda',
  SUBARU = 'subaru',
  LEXUS = 'lexus',
  ACURA = 'acura',
  INFINITI = 'infiniti',
  CADILLAC = 'cadillac',
  BUICK = 'buick',
  GMC = 'gmc',
  JEEP = 'jeep',
  DODGE = 'dodge',
  CHRYSLER = 'chrysler',
  RAM = 'ram',
  LINCOLN = 'lincoln',
  VOLVO = 'volvo',
  JAGUAR = 'jaguar',
  LAND_ROVER = 'land_rover',
  PORSCHE = 'porsche',
  TESLA = 'tesla',
  OTHER = 'other',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
  PLUG_IN_HYBRID = 'plug_in_hybrid',
  CNG = 'cng', // Compressed Natural Gas
  LPG = 'lpg', // Liquefied Petroleum Gas
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt', // Continuously Variable Transmission
  SEMI_AUTOMATIC = 'semi_automatic',
}

export enum CarColor {
  BLACK = 'black',
  WHITE = 'white',
  SILVER = 'silver',
  GRAY = 'gray',
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  BROWN = 'brown',
  PURPLE = 'purple',
  GOLD = 'gold',
  BEIGE = 'beige',
  OTHER = 'other',
}

export enum CarStatus {
  ACTIVE = 'active',
  IN_SERVICE = 'in_service',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  SCRAPPED = 'scrapped',
}

registerEnumType(CarMake, {
  name: 'CarMake',
  description: 'Car manufacturer/make',
});

registerEnumType(FuelType, {
  name: 'FuelType',
  description: 'Type of fuel the car uses',
});

registerEnumType(TransmissionType, {
  name: 'TransmissionType',
  description: 'Type of transmission',
});

registerEnumType(CarColor, {
  name: 'CarColor',
  description: 'Color of the car',
});

registerEnumType(CarStatus, {
  name: 'CarStatus',
  description: 'Current status of the car',
});