import { Plus } from 'lucide-react';
import { useState } from 'react';

const emptyWarehouse = { name: '', address: '', status: 'active' };

const warehouseStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'discontinued', label: 'No longer used' },
];

function statusBadge(status = 'active') {
  if (status === 'active') return 'ok';
  if (status === 'inactive') return 'warn';
  return 'bad';
}

export default function WarehousePage({
  warehouses,
  inventory,
  canManage = false,
  onAddWarehouse,
  onUpdateWarehouseStatus,
}) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyWarehouse);

  function submit(event) {
    event.preventDefault();
    if (!draft.name.trim()) return alert('Warehouse name is required.');
    onAddWarehouse?.(draft);
    setDraft(emptyWarehouse);
    setShowForm(false);
  }

  return (
    <section className="panel full-page-panel">
      <div className="panel-head">
        <div><p className="eyebrow">Stock Locations</p><h2>Warehouse</h2></div>
        {canManage && <button type="button" onClick={() => setShowForm(current => !current)}><Plus size={16} /> Add Warehouse</button>}
      </div>

      {showForm && (
        <form className="inline-edit-form" onSubmit={submit}>
          <label>Warehouse Name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Main Store" /></label>
          <label>Address<input value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })} placeholder="Location or room" /></label>
          <label>Status<select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })}>{warehouseStatuses.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          <button className="primary" type="submit">Save Warehouse</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>No.</th><th>Warehouse</th><th>Address</th><th>Products Stored</th><th>Status</th></tr></thead>
        <tbody>
          {warehouses.map((warehouse, index) => {
            const status = warehouse.status || (warehouse.active === false ? 'inactive' : 'active');
            const count = inventory.filter(item => item.warehouse === warehouse.name).length;
            return (
              <tr key={warehouse.id}>
                <td>{index + 1}</td>
                <td>{warehouse.name}</td>
                <td>{warehouse.address || '-'}</td>
                <td>{count}</td>
                <td>
                  {canManage ? (
                    <select
                      className={`status-select ${statusBadge(status)}`}
                      value={status}
                      onChange={event => onUpdateWarehouseStatus?.(warehouse.id, event.target.value)}
                    >
                      {warehouseStatuses.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
                    </select>
                  ) : (
                    <span className={`badge ${statusBadge(status)}`}>{warehouseStatuses.find(item => item.value === status)?.label || status}</span>
                  )}
                </td>
              </tr>
            );
          })}
          {!warehouses.length && <tr><td colSpan="5" className="empty-row">No warehouse locations yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
