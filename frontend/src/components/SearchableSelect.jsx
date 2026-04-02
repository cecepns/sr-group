import Select from 'react-select';

const slateSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 12,
    borderColor: state.isFocused ? '#64748b' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(100, 116, 139, 0.35)' : 'none',
    '&:hover': { borderColor: '#94a3b8' },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, borderRadius: 12, overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isSelected ? '#334155' : state.isFocused ? '#f1f5f9' : 'white',
    color: state.isSelected ? 'white' : '#334155',
  }),
  singleValue: (base) => ({ ...base, color: '#1e293b' }),
  placeholder: (base) => ({ ...base, color: '#94a3b8' }),
  input: (base) => ({ ...base, color: '#1e293b' }),
};

export function toMaterialOptions(materials) {
  return (materials || []).map((m) => ({
    value: String(m.id),
    label: `${m.nama_material} (${m.satuan})`,
  }));
}

export function toLokasiIdOptions(locations) {
  return (locations || []).map((l) => ({
    value: String(l.id),
    label: l.nama_lokasi,
  }));
}

/** Untuk form yang menyimpan nama lokasi (string), bukan id */
export function toLokasiNamaOptions(locations) {
  return (locations || []).map((l) => ({
    value: l.nama_lokasi,
    label: l.nama_lokasi,
  }));
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  isClearable = true,
  menuPortal = true,
  inputId,
  'aria-label': ariaLabel,
}) {
  const selected =
    value === '' || value == null
      ? null
      : options.find((o) => String(o.value) === String(value)) ?? null;

  return (
    <Select
      inputId={inputId}
      aria-label={ariaLabel}
      options={options}
      value={selected}
      onChange={(opt) => onChange(opt ? String(opt.value) : '')}
      placeholder={placeholder}
      isClearable={isClearable}
      styles={slateSelectStyles}
      menuPortalTarget={menuPortal ? document.body : undefined}
      menuPosition={menuPortal ? 'fixed' : 'absolute'}
      classNamePrefix="ap-stok-select"
      noOptionsMessage={() => 'Tidak ada pilihan'}
    />
  );
}
