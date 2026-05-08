export default function LoadingSpinner({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
}
