import { useState } from 'react'
import { Package, Plus, Search, MoreVertical, Cpu, Activity, Trash2, Edit, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { useApplications, useDeleteApplication } from '../../hooks/useApplications'
import ApplicationModal from '../../components/Modal/ApplicationModal'

const statusLabels = {
  Active: { label: 'Operacional', color: 'badge-success' },
  Warning: { label: 'Atenção', color: 'badge-warning' },
  Archived: { label: 'Arquivado', color: 'badge-gray' },
}

export default function Applications() {
  const { data: applications, isLoading, error } = useApplications()
  const deleteApplication = useDeleteApplication()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAdd = () => {
    setSelectedApplication(null)
    setIsModalOpen(true)
  }

  const handleEdit = (application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja remover a application "${name}"?`)) {
      try {
        await deleteApplication.mutateAsync(id)
      } catch (error) {
        alert(error.message || 'Erro ao remover application')
      }
    }
  }

  const filteredApplications = applications?.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando applications...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Erro ao carregar applications: {error.message}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas aplicações IoT e devices associados
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nova Application
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 input"
          />
        </div>
        <select className="input w-48">
          <option>Todos os status</option>
          <option>Ativos</option>
          <option>Com alertas</option>
        </select>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma application encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Comece adicionando sua primeira application'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Nova Application
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-purple rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {app.description || 'Sem descrição'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'badge',
                    statusLabels[app.status]?.color || 'badge-gray'
                  )}>
                    {statusLabels[app.status]?.label || app.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{app.deviceCount || 0}</span> devices
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(app)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(app.id, app.name)}
                    className="btn btn-error btn-sm"
                    disabled={deleteApplication.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
      />
    </div>
  )
}

