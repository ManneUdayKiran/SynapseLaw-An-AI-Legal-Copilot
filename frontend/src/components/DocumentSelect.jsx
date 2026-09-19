import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function DocumentSelect({ label, documents, value, onChange }) {
  return (
    <FormControl fullWidth sx={{ bgcolor: '#ffffff', borderRadius: 2 }}>
      <InputLabel id={`${label}-label`} sx={{ fontWeight: 600 }}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={{ borderRadius: 2.5 }}
      >
        {documents.map((doc) => (
          <MenuItem key={doc.id} value={doc.id} sx={{ py: 1.2, fontWeight: 500 }}>
            {doc.filename}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
