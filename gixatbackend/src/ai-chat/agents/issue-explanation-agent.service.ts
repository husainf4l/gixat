import { Injectable } from '@nestjs/common';
import { AgentResponse, AgentType } from '../ai-chat.service';

interface IssueQuery {
  issueType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  symptoms?: string[];
  query?: string;
}

@Injectable()
export class IssueExplanationAgentService {
  constructor() {}

  /**
   * Process a message to explain a car-related issue
   * @param message User message
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns Explanation of the issue
   */
  async processMessage(
    message: string,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing query info or initialize new
    let issueQuery: IssueQuery = 
      (sessionData?.extractedInfo as IssueQuery) || {};
    
    // Store the original query
    if (!issueQuery.query) {
      issueQuery.query = message;
    }
    
    // Extract vehicle information if available
    
    // Extract car make and model
    const carMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 
      'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Jeep', 'Tesla', 'Lexus'
    ];
    
    for (const make of carMakes) {
      if (message.toLowerCase().includes(make.toLowerCase())) {
        issueQuery.vehicleMake = make;
        
        // Try to extract model after finding make
        const modelRegex = new RegExp(`${make}\\s+([A-Za-z0-9\\s]+?)(?:[,\\.\\s]|$)`, 'i');
        const modelMatch = message.match(modelRegex);
        if (modelMatch) {
          issueQuery.vehicleModel = modelMatch[1].trim();
        }
        
        break;
      }
    }
    
    // Extract year
    const yearMatch = message.match(/(20[0-2][0-9]|19[8-9][0-9])/);
    if (yearMatch) {
      issueQuery.vehicleYear = parseInt(yearMatch[1], 10);
    }
    
    // Identify issue type based on keywords
    if (message.toLowerCase().includes('engine')) {
      issueQuery.issueType = 'engine';
    } else if (
      message.toLowerCase().includes('brake') || 
      message.toLowerCase().includes('stopping')
    ) {
      issueQuery.issueType = 'brakes';
    } else if (
      message.toLowerCase().includes('transmis') || 
      message.toLowerCase().includes('gear') || 
      message.toLowerCase().includes('shift')
    ) {
      issueQuery.issueType = 'transmission';
    } else if (
      message.toLowerCase().includes('electric') || 
      message.toLowerCase().includes('battery') || 
      message.toLowerCase().includes('light')
    ) {
      issueQuery.issueType = 'electrical';
    } else if (
      message.toLowerCase().includes('cooling') || 
      message.toLowerCase().includes('overheat') || 
      message.toLowerCase().includes('temperature')
    ) {
      issueQuery.issueType = 'cooling';
    } else if (
      message.toLowerCase().includes('steering') || 
      message.toLowerCase().includes('handl') || 
      message.toLowerCase().includes('turn')
    ) {
      issueQuery.issueType = 'steering';
    } else if (
      message.toLowerCase().includes('suspen') || 
      message.toLowerCase().includes('shock') || 
      message.toLowerCase().includes('bumpy')
    ) {
      issueQuery.issueType = 'suspension';
    } else if (
      message.toLowerCase().includes('a/c') || 
      message.toLowerCase().includes('heat') || 
      message.toLowerCase().includes('air condition')
    ) {
      issueQuery.issueType = 'hvac';
    }
    
    // Extract symptoms
    const symptoms = new Set<string>(issueQuery.symptoms || []);
    
    if (message.toLowerCase().includes('noise')) symptoms.add('Unusual noise');
    if (message.toLowerCase().includes('vibrat')) symptoms.add('Vibration');
    if (message.toLowerCase().includes('leak')) symptoms.add('Fluid leak');
    if (message.toLowerCase().includes('smoke')) symptoms.add('Smoke');
    if (message.toLowerCase().includes('smell')) symptoms.add('Unusual smell');
    if (message.toLowerCase().includes('warning light')) symptoms.add('Warning light');
    if (message.toLowerCase().includes('check engine')) symptoms.add('Check engine light');
    if (message.toLowerCase().includes('stall')) symptoms.add('Stalling');
    if (message.toLowerCase().includes('overheat')) symptoms.add('Overheating');
    if (message.toLowerCase().includes('not start')) symptoms.add('Won\'t start');
    if (message.toLowerCase().includes('hard start')) symptoms.add('Hard starting');
    if (message.toLowerCase().includes('rough idle')) symptoms.add('Rough idling');
    if (message.toLowerCase().includes('poor fuel') || message.toLowerCase().includes('gas mileage')) symptoms.add('Poor fuel economy');
    
    issueQuery.symptoms = Array.from(symptoms);
    
    // Generate a response based on the issue type and symptoms
    let response = '';
    
    if (issueQuery.issueType) {
      response = this.generateIssueExplanation(issueQuery);
    } else {
      response = `I'll help explain your car issue. Could you provide more details about the problem you're experiencing? 
      
For example:
- What symptoms are you noticing?
- Is there any unusual noise, vibration, or smell?
- When does the problem occur? (e.g., when starting, accelerating, braking)
- Which part of the car seems to be affected?

The more information you provide, the better I can explain the potential issues.`;
    }
    
    return {
      agentType: AgentType.ISSUE_EXPLANATION,
      extractedInfo: issueQuery,
      response,
      isComplete: true
    };
  }
  
  /**
   * Generate an explanation for the identified issue
   * @param query The issue query with extracted information
   * @returns A detailed explanation of the issue
   */
  private generateIssueExplanation(query: IssueQuery): string {
    let explanation = '';
    const vehicleInfo = this.formatVehicleInfo(query);
    const symptomsText = query.symptoms && query.symptoms.length > 0 
      ? `Based on the symptoms you've described (${query.symptoms.join(', ')}), ` 
      : '';
    
    switch (query.issueType) {
      case 'engine':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your engine issue:

Engine problems can range from minor to serious. Common engine issues include:

1. Ignition system problems: Failing spark plugs or ignition coils can cause misfiring, rough idling, or starting problems.

2. Fuel system issues: Clogged fuel injectors or a failing fuel pump can cause loss of power or stalling.

3. Air intake problems: A dirty air filter or mass airflow sensor can reduce engine performance and efficiency.

4. Oil-related issues: Low oil level or poor oil quality can cause engine overheating or internal damage.

5. Timing belt/chain issues: A worn timing belt or chain can cause engine misfiring or complete failure.

If you're experiencing check engine light, reduced power, unusual noises, or rough running, I recommend having a diagnostic test done to pinpoint the exact cause. Regular maintenance like oil changes and tune-ups can prevent many engine problems.`;
        break;
        
      case 'brakes':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your brake issue:

Brake problems should be addressed immediately for safety. Common brake issues include:

1. Worn brake pads/shoes: Causes squealing noises and reduced stopping power.

2. Warped rotors/drums: Results in pulsation or vibration when braking.

3. Brake fluid leaks: Can cause a soft or spongy brake pedal and reduced braking effectiveness.

4. Stuck calipers: May cause the vehicle to pull to one side when braking or unusual heat from one wheel.

5. ABS system issues: Often indicated by an ABS warning light and potential changes in brake pedal feel.

Warning signs include grinding noises, squealing, vibration when braking, longer stopping distances, soft brake pedal, or warning lights. If you notice any of these symptoms, have your brakes inspected promptly.`;
        break;
        
      case 'transmission':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your transmission issue:

Transmission problems can be complex and often require professional diagnosis. Common issues include:

1. Low or dirty transmission fluid: Can cause rough shifting, slipping, or overheating.

2. Solenoid problems: Electronic solenoids control fluid flow and can cause shifting issues when failing.

3. Clutch issues (in manual or dual-clutch transmissions): Result in slipping, difficulty shifting, or strange noises.

4. Torque converter problems (in automatic transmissions): Can cause shuddering, slipping, or overheating.

5. Worn gears or bearings: Cause noise, vibration, or eventual transmission failure.

Signs of transmission problems include delayed engagement when shifting from park to drive, rough or delayed shifting, slipping, unusual noises (especially in neutral), warning lights, fluid leaks, or burning smell. Regular fluid changes can prevent many transmission issues.`;
        break;
        
      case 'electrical':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your electrical system issue:

Electrical problems can affect many vehicle systems. Common electrical issues include:

1. Battery problems: Including weak charge, corroded terminals, or internal failure.

2. Alternator issues: The alternator charges the battery while driving; failure causes battery drain.

3. Starter motor failure: Results in clicking sounds or failure to start.

4. Wiring problems: Damaged wires can cause intermittent issues with various systems.

5. Fuse or relay failures: Can cause specific electrical components to stop working.

Signs of electrical problems include dimming lights, difficulty starting, electronics that work intermittently, blown fuses, or warning lights. Modern vehicles have complex electrical systems, so professional diagnosis is often needed for persistent issues.`;
        break;
        
      case 'cooling':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your cooling system issue:

Cooling system problems can lead to engine overheating and serious damage. Common issues include:

1. Coolant leaks: From hoses, the radiator, water pump, or other components.

2. Faulty thermostat: Can cause overheating or prevent the engine from reaching proper operating temperature.

3. Water pump failure: Reduces or stops coolant circulation.

4. Radiator problems: Including clogs, damage, or fan malfunctions.

5. Head gasket issues: Can allow coolant to mix with oil or leak into cylinders.

Warning signs include overheating, coolant leaks, sweet smell from the engine, white exhaust smoke, or the heater not working properly. If your temperature gauge reads high or the warning light comes on, stop driving to prevent engine damage and have the system checked promptly.`;
        break;
        
      case 'steering':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your steering issue:

Steering problems can affect vehicle control and safety. Common steering issues include:

1. Power steering fluid leaks: Cause difficulty steering, especially at low speeds.

2. Worn steering components: Including tie rods, ball joints, or steering rack.

3. Alignment problems: Result in pulling to one side or uneven tire wear.

4. Power steering pump failure: Makes steering much harder, especially at low speeds.

5. Electric power steering sensor or motor issues: In vehicles with electric power steering.

Signs of steering problems include difficulty turning the wheel, play in the steering wheel, clicking or clunking noises when turning, vehicle pulling to one side, or steering wheel vibration. Many steering issues affect tire wear and handling, so prompt attention is recommended.`;
        break;
        
      case 'suspension':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your suspension issue:

Suspension problems affect ride comfort, handling, and safety. Common suspension issues include:

1. Worn shock absorbers or struts: Cause bouncing, poor handling, or nose-diving when braking.

2. Damaged springs: Result in uneven ride height or noises over bumps.

3. Ball joint wear: Can cause clunking noises or unpredictable steering.

4. Control arm bushings: When worn, cause alignment issues and noises.

5. Sway bar link failures: Lead to increased body roll when cornering.

Signs of suspension problems include excessive bouncing after bumps, uneven tire wear, nose-diving when braking, knocking or clunking noises, or vehicle leaning to one side. A professional inspection can identify which components need attention.`;
        break;
        
      case 'hvac':
        explanation = `${vehicleInfo}${symptomsText}here's an explanation of your heating, ventilation, or air conditioning (HVAC) issue:

HVAC problems affect cabin comfort. Common HVAC issues include:

1. Refrigerant leaks: Result in reduced cooling performance.

2. Compressor failure: Prevents the A/C system from cooling at all.

3. Blend door actuator problems: Cause incorrect air temperature or direction.

4. Clogged cabin air filter: Reduces airflow and system efficiency.

5. Fan motor issues: Result in weak or no airflow from vents.

Signs of HVAC problems include insufficient cooling or heating, unusual noises when the system runs, bad odors from vents, or inconsistent temperature. Many A/C issues require specialized equipment to diagnose and repair properly, especially those involving refrigerant.`;
        break;
        
      default:
        explanation = `${vehicleInfo}I've analyzed your question about: "${query.query}"

Based on your description, I can provide some general information about possible causes and solutions. However, for a definitive diagnosis, I'd recommend having your vehicle inspected by a professional mechanic.

Common car issues often relate to:

1. Regular maintenance needs: Including oil changes, filter replacements, and fluid checks.

2. Wear and tear on components: Brakes, tires, belts, and other parts have limited lifespans.

3. Environmental factors: Extreme temperatures, road conditions, and driving habits affect vehicle performance.

4. Manufacturing issues: Some vehicles have known issues for specific models and years.

Would you like more specific information about a particular system or symptom? Please provide additional details about what you're experiencing with your vehicle.`;
    }
    
    // Add a recommendation for service
    explanation += `\n\nWould you like to schedule a service appointment for this issue? I can help set that up for you.`;
    
    return explanation;
  }
  
  /**
   * Format vehicle information for response
   * @param query The issue query with vehicle information
   * @returns Formatted vehicle information text
   */
  private formatVehicleInfo(query: IssueQuery): string {
    if (!query.vehicleMake && !query.vehicleModel && !query.vehicleYear) {
      return '';
    }
    
    let vehicleInfo = 'For your ';
    
    if (query.vehicleYear) {
      vehicleInfo += `${query.vehicleYear} `;
    }
    
    if (query.vehicleMake) {
      vehicleInfo += `${query.vehicleMake} `;
    }
    
    if (query.vehicleModel) {
      vehicleInfo += `${query.vehicleModel}`;
    } else if (query.vehicleMake) {
      vehicleInfo = vehicleInfo.trim(); // Remove trailing space if no model
    }
    
    return `${vehicleInfo}, `;
  }
}