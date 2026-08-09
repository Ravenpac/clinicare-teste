import React, { useState, useMemo } from 'react';
import { useClinic } from '../context/ClinicContext';
import { useToast } from '../context/ToastContext';
import { Patient, HealthInsuranceType } from '../types/patient';
import { formatCPF, formatPhone, formatDateBR, calculateAge } from '../utils/formatters';
import { isValidCPF, isValidPhone, isValidBirthDate } from '../utils/validators';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { FormField } from '../components/form/FormField';
import { MaskedInput } from '../components/form/MaskedInput';
import { Search, UserPlus, Phone, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export const PatientsView: React.FC = () => {
  const { patients, addPatient, updatePatient } = useClinic();
  const { showSuccess, showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'outro' | 'nao_informado'>('F');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [healthInsurance, setHealthInsurance] = useState<HealthInsuranceType>('particular');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase().replace(/[.\-()\s]/g, '');

    return patients.filter((p) => {
      const nameMatch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const cpfMatch = p.cpf.replace(/\D/g, '').includes(query);
      const phoneMatch = p.phone.replace(/\D/g, '').includes(query);
      const emailMatch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || cpfMatch || phoneMatch || emailMatch;
    });
  }, [patients, searchQuery]);

  const handleOpenNew = () => {
    setEditingPatient(null);
    setFullName('');
    setCpf('');
    setBirthDate('');
    setGender('F');
    setPhone('');
    setEmail('');
    setCep('01310-200');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('São Paulo');
    setState('SP');
    setHealthInsurance('particular');
    setInsuranceNumber('');
    setNotes('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setFullName(p.fullName);
    setCpf(p.cpf);
    setBirthDate(p.birthDate);
    setGender(p.gender);
    setPhone(p.phone);
    setEmail(p.email || '');
    setCep(p.address.cep);
    setStreet(p.address.street);
    setNumber(p.address.number);
    setNeighborhood(p.address.neighborhood);
    setCity(p.address.city);
    setState(p.address.state);
    setHealthInsurance(p.healthInsurance);
    setInsuranceNumber(p.insuranceNumber || '');
    setNotes(p.notes || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'O nome completo é obrigatório.';

    if (!cpf) {
      errs.cpf = 'O CPF é obrigatório.';
    } else if (!isValidCPF(cpf)) {
      errs.cpf = 'CPF inválido.';
    }

    if (!phone) {
      errs.phone = 'O telefone é obrigatório.';
    } else if (!isValidPhone(phone)) {
      errs.phone = 'Telefone inválido.';
    }

    if (birthDate && !isValidBirthDate(birthDate)) {
      errs.birthDate = 'Data de nascimento inválida.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showError('Verifique os erros no formulário antes de salvar.', 'Campos Inválidos');
      return;
    }

    const patientData = {
      fullName: fullName.trim(),
      cpf,
      birthDate: birthDate || '1990-01-01',
      gender,
      phone,
      email: email.trim() || undefined,
      address: {
        cep: cep || '01000-000',
        street: street.trim() || 'Não informada',
        number: number.trim() || 'S/N',
        neighborhood: neighborhood.trim() || 'Centro',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
      },
      healthInsurance,
      insuranceNumber: insuranceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingPatient) {
      updatePatient(editingPatient.id, patientData);
      showSuccess(`Cadastro de ${fullName} atualizado com sucesso!`, 'Paciente Atualizado');
    } else {
      addPatient(patientData);
      showSuccess(`Novo paciente ${fullName} cadastrado com sucesso!`, 'Paciente Cadastrado');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-2 border-bottom">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Diretório de Pacientes</h1>
          <p className="text-secondary small mb-0">
            Cadastre, consulte dados de contato, convênios e histórico dos pacientes da clínica.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenNew}
          leftIcon={<UserPlus size={16} />}
        >
          Cadastrar Paciente
        </Button>
      </div>

      <div className="card shadow-sm border p-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Search size={16} aria-hidden="true" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar por nome do paciente, CPF, telefone ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Campo de busca de pacientes"
              />
            </div>
          </div>
          <div className="col-12 col-md-4 text-md-end">
            <span className="text-muted small">
              Total de <strong>{filteredPatients.length}</strong> pacientes cadastrados
            </span>
          </div>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="card shadow-sm border p-4">
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Não encontramos nenhum cadastro que corresponda à sua busca."
            actionText="Cadastrar Novo Paciente"
            onAction={handleOpenNew}
          />
        </div>
      ) : (
        <div className="row g-3">
          {filteredPatients.map((p) => {
            const age = p.birthDate ? calculateAge(p.birthDate) : null;

            return (
              <div key={p.id} className="col-12 col-md-6 col-xl-4">
                <div className="card shadow-sm border h-100 p-3 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <div>
                        <h2 className="fs-6 fw-bold text-dark mb-1">{p.fullName}</h2>
                        <span className="text-muted small">CPF: {formatCPF(p.cpf)}</span>
                      </div>
                      <span className="badge bg-primary-subtle text-primary-emphasis text-capitalize border">
                        {p.healthInsurance}
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-1 text-secondary small my-2">
                      <div className="d-flex align-items-center gap-1">
                        <Phone size={13} className="text-muted" aria-hidden="true" />
                        <a
                          href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-success text-decoration-none fw-semibold"
                        >
                          {formatPhone(p.phone)}
                        </a>
                      </div>

                      {p.birthDate && (
                        <div className="d-flex align-items-center gap-1">
                          <Calendar size={13} className="text-muted" aria-hidden="true" />
                          <span>
                            {formatDateBR(p.birthDate)} ({age} anos)
                          </span>
                        </div>
                      )}

                      {p.address && (
                        <div className="d-flex align-items-center gap-1 text-truncate">
                          <MapPin size={13} className="text-muted shrink-0" aria-hidden="true" />
                          <span className="text-truncate">
                            {p.address.neighborhood}, {p.address.city}/{p.address.state}
                          </span>
                        </div>
                      )}

                      {p.notes && (
                        <div className="p-2 bg-light rounded mt-2 small text-muted">
                          <strong>Obs:</strong> {p.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-end gap-2 mt-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEdit(p)}>
                      Editar Cadastro
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Editar Cadastro de Paciente' : 'Novo Paciente'}
        subtitle="Preencha os dados cadastrais, endereço e convênio do paciente"
        size="lg"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="light" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<CheckCircle2 size={16} />}>
              Salvar Paciente
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField id="cad-patient-cpf" label="CPF" required error={errors.cpf}>
                <MaskedInput
                  mask="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(val) => setCpf(val)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField
                id="cad-patient-fullname"
                label="Nome Completo"
                required
                error={errors.fullName}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome do paciente"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField
                id="cad-patient-birthdate"
                label="Data de Nascimento"
                error={errors.birthDate}
              >
                <input
                  type="date"
                  className="form-control"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField id="cad-patient-gender" label="Gênero">
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as 'M' | 'F' | 'outro' | 'nao_informado')
                  }
                >
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informado">Não informado</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField
                id="cad-patient-phone"
                label="Telefone / Celular"
                required
                error={errors.phone}
              >
                <MaskedInput
                  mask="phone"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(val) => setPhone(val)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="cad-patient-email" label="E-mail">
                <input
                  type="email"
                  className="form-control"
                  placeholder="paciente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="cad-patient-insurance" label="Convênio">
                <select
                  className="form-select"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(e.target.value as HealthInsuranceType)}
                >
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="bradesco">Bradesco Saúde</option>
                  <option value="amil">Amil</option>
                  <option value="sulamerica">SulAmérica</option>
                  <option value="notredame">NotreDame Intermédica</option>
                  <option value="outro">Outro Convênio</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-3">
              <FormField id="cad-patient-cep" label="CEP">
                <MaskedInput
                  mask="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(val) => setCep(val)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="cad-patient-street" label="Endereço">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rua / Av"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-3">
              <FormField id="cad-patient-number" label="Número">
                <input
                  type="text"
                  className="form-control"
                  placeholder="123"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-5">
              <FormField id="cad-patient-neighborhood" label="Bairro">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-5">
              <FormField id="cad-patient-city" label="Cidade">
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-2">
              <FormField id="cad-patient-state" label="UF">
                <input
                  type="text"
                  className="form-control"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                />
              </FormField>
            </div>

            <div className="col-12">
              <FormField id="cad-patient-notes" label="Anotações Clínicas / Alergias">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ex: Alérgico a penicilina, diabético..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
