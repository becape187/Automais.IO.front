import { useState } from 'react'
import Modal from './Modal'
import { useCreateRouter, useUpdateRouter } from '../../hooks/useRouters'

export default function RouterModal({ isOpen, onClose, router = null }) {
  const isEditing = !!router
  const createRouter = useCreateRouter()
  const updateRouter = useUpdateRouter()

  const [formData, setFormData] = useState({
    name: router?.name || '',
    serialNumber: router?.serialNumber || '',
    model: router?.model || '',
    routerOsApiUrl: router?.routerOsApiUrl || '',
    routerOsApiUsername: '',
    routerOsApiPassword: '',
    description: router?.description || '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    if (formData.routerOsApiUrl && !formData.routerOsApiUrl.startsWith('http')) {
      newErrors.routerOsApiUrl = 'URL deve começar com http:// ou https://'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (isEditing) {
        await updateRouter.mutateAsync({
          id: router.id,
          data: formData,
        })
      } else {
        await createRouter.mutateAsync(formData)
      }
      onClose()
      // Reset form
      setFormData({
        name: '',
        serialNumber: '',
        model: '',
        routerOsApiUrl: '',
        routerOsApiUsername: '',
        routerOsApiPassword: '',
        description: '',
      })
    } catch (error) {
      console.error('Erro ao salvar router:', error)
      alert(error.message || 'Erro ao salvar router')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Router' : 'Adicionar Router'}
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
            placeholder="Ex: Router Matriz"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Série
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="input w-full"
              placeholder="Ex: SN123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="input w-full"
              placeholder="Ex: RB750Gr3"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da API RouterOS
          </label>
          <input
            type="text"
            name="routerOsApiUrl"
            value={formData.routerOsApiUrl}
            onChange={handleChange}
            className={`input w-full ${errors.routerOsApiUrl ? 'border-red-500' : ''}`}
            placeholder="Ex: http://192.168.1.1"
          />
          {errors.routerOsApiUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.routerOsApiUrl}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário API
            </label>
            <input
              type="text"
              name="routerOsApiUsername"
              value={formData.routerOsApiUsername}
              onChange={handleChange}
              className="input w-full"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha API
            </label>
            <input
              type="password"
              name="routerOsApiPassword"
              value={formData.routerOsApiPassword}
              onChange={handleChange}
              className="input w-full"
              placeholder="••••••••"
            />
          </div>
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
            rows="3"
            placeholder="Descrição opcional do router"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={createRouter.isPending || updateRouter.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createRouter.isPending || updateRouter.isPending}
          >
            {createRouter.isPending || updateRouter.isPending
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

