import { useState } from 'react'
import Modal from './Modal'
import { useCreateApplication, useUpdateApplication } from '../../hooks/useApplications'

export default function ApplicationModal({ isOpen, onClose, application = null }) {
  const isEditing = !!application
  const createApplication = useCreateApplication()
  const updateApplication = useUpdateApplication()

  const [formData, setFormData] = useState({
    name: application?.name || '',
    description: application?.description || '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (isEditing) {
        await updateApplication.mutateAsync({
          id: application.id,
          data: formData,
        })
      } else {
        await createApplication.mutateAsync(formData)
      }
      onClose()
      setFormData({
        name: '',
        description: '',
      })
    } catch (error) {
      console.error('Erro ao salvar application:', error)
      alert(error.message || 'Erro ao salvar application')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Application' : 'Adicionar Application'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Ex: Monitoramento HVAC"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full"
            rows="4"
            placeholder="Descrição da aplicação IoT"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={createApplication.isPending || updateApplication.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createApplication.isPending || updateApplication.isPending}
          >
            {createApplication.isPending || updateApplication.isPending
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar'
              : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

