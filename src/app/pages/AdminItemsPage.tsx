import { useNavigate } from 'react-router';
import { AdminItemsPanel } from '../components/ttrpg/AdminItemsPanel';

export function AdminItemsPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin');
  };

  return <AdminItemsPanel onClose={handleClose} />;
}
