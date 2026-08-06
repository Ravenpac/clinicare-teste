import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../form/FormField';
import { MaskedInput } from '../form/MaskedInput';
import { isValidCPF, isValidPhone, isValidBirthDate } from '../../utils/validators';
import { calculateAge } from '../../utils/formatters';
import { calculateEndTime, getTodayDateString } from '../../utils/dateUtils';
import { AppointmentType } from '../../types/appointment';
import { PaymentMethod, PaymentStatus } from '../../types/payment';
import { HealthInsuranceType } from '../../types/patient';
import { AlertTriangle, CheckCircle2, Search, ArrowRight, ArrowLeft } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  initialDate?: string;
  initialTime?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  initialDate,
  initialTime,
}) => {
  const { doctors, patients, addAppointment, checkConflict, findPatientByCpf } = useClinic();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [type, setType] = useState<AppointmentType>('first_consultation');
  const [notes, setNotes] = useState('');

  const [selectedPatientId, setSelectedPatientId] = useState('');
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

  const [amount, setAmount] = useState<number>(350);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [installments, setInstallments] = useState(1);
  const [paymentNotes, setPaymentNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultDoc =
        initialDoctorId && initialDoctorId !== 'all' ? initialDoctorId : doctors[0]?.id || '';
      const defaultDate = initialDate || getTodayDateString();
      const defaultTime = initialTime || '09:00';

      setDoctorId(defaultDoc);
      setDate(defaultDate);
      setStartTime(defaultTime);
      setEndTime(calculateEndTime(defaultTime, 30));
      setType('first_consultation');
      setNotes('');

      const doc = doctors.find((d) => d.id === defaultDoc);
      if (doc) {
        setAmount(doc.consultationFee);
      }

      setStep(1);
      setErrors({});
      setConflictWarning(null);
      resetPatientFields();
    }
  }, [isOpen, initialDoctorId, initialDate, initialTime, doctors]);

  const resetPatientFields = () => {
    setSelectedPatientId('');
    setFullName('');
    setCpf('');
    setBirthDate('');
    setGender('F');
    setPhone('');
    setEmail('');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('São Paulo');
    setState('SP');
    setHealthInsurance('particular');
    setInsuranceNumber('');
  };

  const handleDoctorChange = (newDocId: string) => {
    setDoctorId(newDocId);
    const doc = doctors.find((d) => d.id === newDocId);
    if (doc) {
      setAmount(doc.consultationFee);
      const calculatedEnd = calculateEndTime(startTime, doc.workingHours.slotDurationMinutes || 30);
      setEndTime(calculatedEnd);
    }
  };

  useEffect(() => {
    if (doctorId && date && startTime && endTime) {
      const result = checkConflict(doctorId, date, startTime, endTime);
      if (result.hasConflict) {
        setConflictWarning(result.message || 'Conflito detectado no horário selecionado.');
      } else {
        setConflictWarning(null);
      }
    }
  }, [doctorId, date, startTime, endTime, checkConflict]);

  const handleCpfBlur = () => {
    if (cpf.length === 14) {
      const existing = findPatientByCpf(cpf);
      if (existing) {
        setSelectedPatientId(existing.id);
        setFullName(existing.fullName);
        setBirthDate(existing.birthDate);
        setGender(existing.gender);
        setPhone(existing.phone);
        setEmail(existing.email || '');
        setCep(existing.address.cep);
        setStreet(existing.address.street);
        setNumber(existing.address.number);
        setNeighborhood(existing.address.neighborhood);
        setCity(existing.address.city);
        setState(existing.address.state);
        setHealthInsurance(existing.healthInsurance);
        setInsuranceNumber(existing.insuranceNumber || '');
        showSuccess(`Paciente cadastrado localizado: ${existing.fullName}`, 'Cadastro Encontrado');
      }
    }
  };

  const handleSelectExistingPatient = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    if (p) {
      setSelectedPatientId(p.id);
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
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!doctorId) newErrors.doctorId = 'Selecione o médico responsável.';
    if (!date) newErrors.date = 'Informe a data do agendamento.';
    if (!startTime) newErrors.startTime = 'Informe o horário de início.';
    if (!endTime) newErrors.endTime = 'Informe o horário de término.';

    if (conflictWarning) {
      newErrors.conflict = conflictWarning;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'O nome completo do paciente é obrigatório.';

    if (!cpf) {
      newErrors.cpf = 'O CPF é obrigatório.';
    } else if (!isValidCPF(cpf)) {
      newErrors.cpf = 'CPF inválido. Verifique os dígitos digitados.';
    }

    if (!phone) {
      newErrors.phone = 'O telefone / celular é obrigatório.';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Telefone inválido. Formato esperado: (DDD) 90000-0000.';
    }

    if (birthDate && !isValidBirthDate(birthDate)) {
      newErrors.birthDate = 'Data de nascimento inválida.';
    }

    if (!street.trim()) newErrors.street = 'O logradouro/rua é obrigatório.';
    if (!number.trim()) newErrors.number = 'O número é obrigatório.';
    if (!neighborhood.trim()) newErrors.neighborhood = 'O bairro é obrigatório.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
      showError(
        'Por favor, corrija os erros do formulário antes de salvar.',
        'Campos Obrigatórios'
      );
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
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
      },
      healthInsurance,
      insuranceNumber: insuranceNumber.trim() || undefined,
    };

    const result = addAppointment({
      doctorId,
      date,
      startTime,
      endTime,
      type,
      notes: notes.trim() || undefined,
      patientId: selectedPatientId || undefined,
      patientData,
      payment: {
        amount,
        method: paymentMethod,
        status: paymentStatus,
        installments: paymentMethod === 'credit_card' ? installments : undefined,
        notes: paymentNotes.trim() || undefined,
      },
    });

    if (!result.success) {
      showError(
        result.conflict?.message || 'Erro ao agendar consulta devido a conflito de horário.',
        'Conflito de Horário'
      );
      return;
    }

    showSuccess(
      `Consulta agendada para ${fullName} com sucesso para ${date} às ${startTime}.`,
      'Agendamento Concluído'
    );
    onClose();
  };

  const patientAge = calculateAge(birthDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Agendamento de Consulta"
      subtitle={`Etapa ${step} de 3 — ${
        step === 1
          ? 'Dados da Consulta'
          : step === 2
            ? 'Dados do Paciente'
            : 'Pagamento & Faturamento'
      }`}
      size="lg"
      footer={
        <div className="d-flex align-items-center justify-content-between w-100">
          <div>
            {step > 1 && (
              <Button
                variant="light"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                leftIcon={<ArrowLeft size={16} />}
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (step === 1 && validateStep1()) setStep(2);
                  if (step === 2 && validateStep2()) setStep(3);
                }}
                rightIcon={<ArrowRight size={16} />}
              >
                Próximo Passo
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                leftIcon={<CheckCircle2 size={16} />}
              >
                Confirmar Agendamento
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div
        className="d-flex align-items-center justify-content-between mb-4 px-2"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        <div
          className={`d-flex align-items-center gap-2 ${step >= 1 ? 'text-primary-700 fw-bold' : 'text-muted'}`}
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
            style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
          >
            1
          </div>
          <span className="small d-none d-sm-inline">1. Consulta</span>
        </div>

        <div
          className="grow mx-2 border-top border-2"
          style={{ borderColor: step >= 2 ? 'var(--primary-600)' : 'var(--neutral-200)' }}
        />

        <div
          className={`d-flex align-items-center gap-2 ${step >= 2 ? 'text-primary-700 fw-bold' : 'text-muted'}`}
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
            style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
          >
            2
          </div>
          <span className="small d-none d-sm-inline">2. Paciente</span>
        </div>

        <div
          className="grow mx-2 border-top border-2"
          style={{ borderColor: step >= 3 ? 'var(--primary-600)' : 'var(--neutral-200)' }}
        />

        <div
          className={`d-flex align-items-center gap-2 ${step >= 3 ? 'text-primary-700 fw-bold' : 'text-muted'}`}
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
            style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
          >
            3
          </div>
          <span className="small d-none d-sm-inline">3. Pagamento</span>
        </div>
      </div>

      {conflictWarning && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3"
          role="alert"
        >
          <AlertTriangle size={18} className="shrink-0" />
          <div>{conflictWarning}</div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField
                id="apt-doctor"
                label="Médico Responsável"
                required
                error={errors.doctorId}
              >
                <select
                  className="form-select"
                  value={doctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                >
                  <option value="">Selecione um médico...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty}) — Sala {doc.roomNumber}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="apt-type" label="Tipo de Atendimento" required>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                >
                  <option value="first_consultation">Primeira Consulta</option>
                  <option value="follow_up">Retorno</option>
                  <option value="routine_checkup">Exame de Rotina / Check-up</option>
                  <option value="emergency">Encaixe / Urgência</option>
                  <option value="procedure">Procedimento Clínico</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField id="apt-date" label="Data da Consulta" required error={errors.date}>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField
                id="apt-start-time"
                label="Horário Inicial"
                required
                error={errors.startTime}
              >
                <input
                  type="time"
                  className="form-control"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setEndTime(calculateEndTime(e.target.value, 30));
                  }}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField
                id="apt-end-time"
                label="Horário de Término"
                required
                error={errors.endTime}
              >
                <input
                  type="time"
                  className="form-control"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12">
              <FormField id="apt-notes" label="Observações Clínicas ou Queixa Principal">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ex: Queixa de dor de cabeça crônica, paciente solicitou encaixe matutino..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-3 p-3 bg-light rounded border">
            <label
              htmlFor="select-existing-patient"
              className="form-label small fw-bold text-dark d-flex align-items-center gap-1"
            >
              <Search size={14} aria-hidden="true" />
              Preencher com Paciente já Cadastrado (Opcional)
            </label>
            <select
              id="select-existing-patient"
              className="form-select form-select-sm"
              value={selectedPatientId}
              onChange={(e) => handleSelectExistingPatient(e.target.value)}
            >
              <option value="">-- Selecione ou digite os dados abaixo --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (CPF: {p.cpf})
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField
                id="patient-cpf"
                label="CPF do Paciente"
                required
                error={errors.cpf}
                hint="Digite para autocompletar cadastro se existente"
              >
                <MaskedInput
                  mask="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(val) => setCpf(val)}
                  onBlur={handleCpfBlur}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField
                id="patient-fullname"
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
                id="patient-birthdate"
                label="Data de Nascimento"
                error={errors.birthDate}
                hint={patientAge !== null ? `${patientAge} anos` : undefined}
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
              <FormField id="patient-gender" label="Gênero">
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
                  <option value="nao_informado">Prefiro não informar</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-4">
              <FormField
                id="patient-phone"
                label="Celular / WhatsApp"
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
              <FormField id="patient-email" label="E-mail (opcional)">
                <input
                  type="email"
                  className="form-control"
                  placeholder="paciente@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="patient-insurance" label="Convênio / Plano de Saúde">
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
              <FormField id="patient-cep" label="CEP">
                <MaskedInput
                  mask="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(val) => setCep(val)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField
                id="patient-street"
                label="Endereço / Logradouro"
                required
                error={errors.street}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Av. Paulista"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-3">
              <FormField id="patient-number" label="Número" required error={errors.number}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: 1200"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-5">
              <FormField
                id="patient-neighborhood"
                label="Bairro"
                required
                error={errors.neighborhood}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Bela Vista"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-5">
              <FormField id="patient-city" label="Cidade">
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-2">
              <FormField id="patient-state" label="UF">
                <input
                  type="text"
                  className="form-control"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                />
              </FormField>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="p-3 bg-light rounded border mb-4">
            <h4 className="fs-6 fw-bold text-dark mb-2">Resumo da Consulta</h4>
            <div className="row g-2 text-secondary small">
              <div className="col-12 col-sm-6">
                <strong>Paciente:</strong> {fullName} (CPF: {cpf})
              </div>
              <div className="col-12 col-sm-6">
                <strong>Médico:</strong> {doctors.find((d) => d.id === doctorId)?.name}
              </div>
              <div className="col-12 col-sm-6">
                <strong>Data & Horário:</strong> {date} das {startTime} às {endTime}
              </div>
              <div className="col-12 col-sm-6">
                <strong>Plano:</strong> <span className="text-capitalize">{healthInsurance}</span>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField id="payment-amount" label="Valor da Consulta (R$)" required>
                <MaskedInput
                  mask="currency"
                  value={amount}
                  onChange={(val) => setAmount(parseFloat(val) || 0)}
                />
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="payment-status" label="Status do Pagamento" required>
                <select
                  className="form-select"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                >
                  <option value="paid">Pago (Recebido no agendamento)</option>
                  <option value="pending">Pendente (Pagar na recepção)</option>
                  <option value="billed">Faturado para Convênio</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="payment-method" label="Forma de Pagamento" required>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="insurance">Guia do Convênio</option>
                  <option value="pending">A Definir na Recepção</option>
                </select>
              </FormField>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="col-12 col-md-6">
                <FormField id="payment-installments" label="Número de Parcelas">
                  <select
                    className="form-select"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                  >
                    <option value={1}>1x à vista</option>
                    <option value={2}>2x sem juros</option>
                    <option value={3}>3x sem juros</option>
                    <option value={6}>6x sem juros</option>
                  </select>
                </FormField>
              </div>
            )}

            <div className="col-12">
              <FormField id="payment-notes" label="Observações de Faturamento / Recibo">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Pagou adiantado via QR Code Pix, solicitou recibo com CPF..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
