export interface MunicipalStaff {
  id: string;
  name: string;
  role: string;
  phone: string;
  activeTicketCount: number;
}

export interface PollachiWard {
  id: number; // 1 to 36
  wardNumber: number;
  name: string;
  tamilName: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  landmarks: string[];
  sanitaryInspector: MunicipalStaff;
  juniorEngineer: MunicipalStaff;
  populationApprox: number;
  activeGrievances: number;
  resolvedGrievances: number;
  latitude: number;
  longitude: number;
}
