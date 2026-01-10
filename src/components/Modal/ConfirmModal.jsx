import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) {
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirmar ação'}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-yellow-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className="btn btn-primary"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

