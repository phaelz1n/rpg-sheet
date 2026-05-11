import { useNavigate } from 'react-router';
import { AdminItemsPanel } from '../components/rpg/AdminItemsPanel';
import { ttrpgApi } from '../lib/ttrpg-api';

export function AdminItemsPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin');
  };

  return <AdminItemsPanel onClose={handleClose} />;
}
