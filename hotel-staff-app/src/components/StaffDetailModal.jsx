export default function StaffDetailModal({ staff, onClose }) {
  if (!staff) return null;

  const rows = [
    ['Employee Code', staff.employeeCode],
    ['Full Name',     staff.fullName],
    ['Email',         staff.email],
    ['Phone',         staff.phone],
    ['Role',          staff.role],
    ['Department',    staff.department],
    ['Shift',         staff.shift],
    ['Status',        staff.status],
    ['Joining Date',  staff.joiningDate],
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        <h2>Staff Details</h2>
        {rows.map(([label, value]) => (
          <div className="detail-row" key={label}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
