export interface PatientAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type HealthInsuranceType =
  'particular' | 'unimed' | 'bradesco' | 'amil' | 'sulamerica' | 'notredame' | 'outro';

export interface Patient {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  gender: 'M' | 'F' | 'outro' | 'nao_informado';
  phone: string;
  email?: string;
  address: PatientAddress;
  healthInsurance: HealthInsuranceType;
  insuranceNumber?: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}
