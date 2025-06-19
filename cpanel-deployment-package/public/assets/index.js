// Minimal frontend placeholder for production deployment
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="text-align: center; padding: 2rem; font-family: Arial, sans-serif;">
        <h1 style="color: #007bff; margin-bottom: 1rem;">Jaberco E-commerce Platform</h1>
        <p style="margin-bottom: 1rem;">Application is running successfully!</p>
        <p style="color: #666;">Frontend components loading...</p>
      </div>
    `;
  }
});