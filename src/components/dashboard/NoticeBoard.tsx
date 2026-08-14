import React, { useState } from 'react';
import { Bell, Plus, Info, Trash2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { FormField } from '../form/FormField';
import { Notice, NoticePriority, NOTICE_PRIORITY_LABELS } from '../../types/notice';

export const NoticeBoard: React.FC = () => {
  const { notices, addNotice, deleteNotice } = useClinic();
  const { showSuccess } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<NoticePriority>('important');
  const [author, setAuthor] = useState('Recepção');
  const [error, setError] = useState('');

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Por favor, preencha o título e a mensagem do aviso.');
      return;
    }

    addNotice({
      title: title.trim(),
      message: message.trim(),
      priority,
      author: author.trim() || 'Recepção',
    });

    showSuccess('Aviso cadastrado no mural da recepção.', 'Aviso Criado');
    setTitle('');
    setMessage('');
    setError('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, noticeTitle: string) => {
    deleteNotice(id);
    showSuccess(`Aviso "${noticeTitle}" removido do mural.`, 'Aviso Removido');
  };

  const getPriorityBadgeClass = (p: NoticePriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
      case 'important':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'info':
      default:
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    }
  };

  return (
    <>
      <div className="card shadow-sm h-100" role="region" aria-label="Quadro de Avisos e Lembretes">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Bell size={20} className="text-primary-600" aria-hidden="true" />
            <h2 className="fs-6 fw-bold mb-0 text-dark">Avisos & Lembretes</h2>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            className="btn-icon-on-mobile"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={14} />}
            aria-label="Novo Aviso"
          >
            Novo Aviso
          </Button>
        </div>

        <div className="card-body p-3">
          {notices.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <Info size={28} className="mb-2 text-muted" aria-hidden="true" />
              <p className="small mb-0">Nenhum aviso ativo no momento.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {notices.map((notice: Notice) => (
                <div key={notice.id} className="p-3 rounded border bg-light position-relative">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <h3 className="fs-6 fw-bold text-dark mb-0">{notice.title}</h3>
                    </div>
                    <span
                      className={`badge rounded-pill  ${getPriorityBadgeClass(notice.priority)}`}
                    >
                      {NOTICE_PRIORITY_LABELS[notice.priority]}
                    </span>
                  </div>

                  <p className="small text-secondary mb-2" style={{ lineHeight: '1.45' }}>
                    {notice.message}
                  </p>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle small text-muted">
                    <span>
                      Por: <strong className="text-dark">{notice.author}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0 text-decoration-none small"
                      onClick={() => handleDelete(notice.id, notice.title)}
                      aria-label={`Excluir aviso: ${notice.title}`}
                    >
                      <Trash2 size={14} className="me-1" aria-hidden="true" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError('');
        }}
        title="Novo Aviso para a Recepção"
        subtitle="Publique lembretes ou informações de escala para os funcionários e médicos"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="light" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveNotice}>
              Publicar Aviso
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveNotice}>
          {error && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {error}
            </div>
          )}

          <FormField id="notice-title" label="Título do Aviso" required>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Atraso médico, manutenção de equipamento..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField id="notice-priority" label="Nível de Prioridade" required>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NoticePriority)}
                >
                  <option value="info">Informativo</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
              </FormField>
            </div>

            <div className="col-12 col-md-6">
              <FormField id="notice-author" label="Autor / Responsável">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Seu nome ou setor"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <FormField id="notice-message" label="Mensagem do Aviso" required>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Descreva detalhadamente o aviso ou orientação para a equipe..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
};
