import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'

interface TipoNegocio {
  id_tipo_negocio: number
  nombre: string
  descripcion?: string
}

interface FormData {
  nombre: string
  descripcion: string
}

export default function TiposNegocioPage() {
  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([])
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: ''
  })
  const [currentTipoNegocio, setCurrentTipoNegocio] = useState<TipoNegocio | null>(null)
  const [open, setOpen] = useState(false)

  const dataTableProps = {
    tableStyle: { minWidth: '50rem' },
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    stripedRows: true,
    loading: false
  }

  const fetchTiposNegocio = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-negocio`)
      const data = await response.json()
      setTiposNegocio(data)
    } catch (error) {
      console.error('Error al obtener tipos de negocio:', error)
    }
  }

  useEffect(() => {
    fetchTiposNegocio()
  }, [])

  const handleOpen = (tipo?: TipoNegocio) => {
    if (tipo) {
      setCurrentTipoNegocio(tipo)
      setFormData({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || ''
      })
    } else {
      setCurrentTipoNegocio(null)
      setFormData({
        nombre: '',
        descripcion: ''
      })
    }
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-negocio`, {
        method: currentTipoNegocio ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentTipoNegocio ? {
          id_tipo_negocio: currentTipoNegocio.id_tipo_negocio,
          ...formData
        } : formData)
      })

      if (response.ok) {
        fetchTiposNegocio()
        setOpen(false)
        setFormData({ nombre: '', descripcion: '' })
        setCurrentTipoNegocio(null)
      }
    } catch (error) {
      console.error('Error al guardar tipo de negocio:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este tipo de negocio?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-negocio?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchTiposNegocio()
        }
      } catch (error) {
        console.error('Error al eliminar tipo de negocio:', error)
      }
    }
  }

  const columns = [
    { field: 'id_tipo_negocio', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'descripcion', header: 'Descripción' },
    {
      field: 'acciones',
      header: 'Acciones',
      body: (rowData: TipoNegocio) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            rounded
            className="p-button-rounded p-button-success"
            onClick={() => handleOpen(rowData)}
          />
          <Button
            icon="pi pi-trash"
            rounded
            className="p-button-rounded p-button-danger"
            severity="danger"
            onClick={() => handleDelete(rowData.id_tipo_negocio)}
          />
        </div>
      )
    }
  ]

  return (
    <div className="card">
      <div className="flex justify-content-between mb-4">
        <h1 className="text-2xl mb-0">Tipos de Negocio</h1>
        <Button
          label="Nuevo Tipo de Negocio"
          icon="pi pi-plus"
          onClick={() => handleOpen()}
        />
      </div>

      <DataTable value={tiposNegocio} {...dataTableProps}>
        {columns.map((col) => (
          <Column key={col.field} {...col} />
        ))}
      </DataTable>

      <Dialog
        visible={open}
        onHide={() => setOpen(false)}
        header={currentTipoNegocio ? 'Editar Tipo de Negocio' : 'Nuevo Tipo de Negocio'}
      >
        <form onSubmit={handleSubmit} className="flex flex-column gap-3 pt-4">
          <div className="field">
            <label htmlFor="nombre" className="block font-bold mb-2">
              Nombre
            </label>
            <InputText
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="descripcion" className="block font-bold mb-2">
              Descripción
            </label>
            <InputTextarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full"
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setOpen(false)}
              type="button"
              text
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              type="submit"
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
} 