import { Link } from 'react-router-dom';

export default function NewNotePage() {
  return (
    <div className="placeholder-page">
      <h1>New Note</h1>
      <p>Note creation form coming soon...</p>
      <Link to="/dashboard" className="btn btn-outline">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
