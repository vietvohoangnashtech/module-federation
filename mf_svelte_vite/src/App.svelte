<script lang="ts">
  let title = 'Svelte Module Federation';
</script>

<main>
  <div class="container">
    <header>
      <h1>{title}</h1>
      <p class="subtitle">Powered by Vite Module Federation</p>
    </header>
    
    <section>
      <div class="card">
        <h2>🚀 Welcome to Svelte MFE</h2>
        <p>This is a Module Federation remote application built with Svelte and Vite.</p>
        
        <div class="features">
          <div class="feature">
            <span class="icon">⚡</span>
            <h3>Blazing Fast</h3>
            <p>Vite provides instant HMR and optimized builds</p>
          </div>
          
          <div class="feature">
            <span class="icon">🎯</span>
            <h3>Reactive</h3>
            <p>Svelte compiles to vanilla JavaScript</p>
          </div>
          
          <div class="feature">
            <span class="icon">🔧</span>
            <h3>Lightweight</h3>
            <p>No virtual DOM, minimal runtime overhead</p>
          </div>
        </div>
      </div>
      
      <div class="info">
        <p>✨ This remote can be consumed by any Module Federation host</p>
        <p>📦 Exposed components: <code>./App</code></p>
      </div>
    </section>
  </div>
</main>

<style>
  .container {
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #ff3e00 0%, #f9ab00 100%);
  }

  header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  header .subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
  }

  section {
    max-width: 1200px;
    margin: 0 auto;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    margin-bottom: 2rem;
  }

  .card h2 {
    color: #ff3e00;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  .card > p {
    color: #666;
    font-size: 1.125rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .feature {
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: transform 0.2s;
  }

  .feature:hover {
    transform: translateY(-4px);
  }

  .feature .icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 1rem;
  }

  .feature h3 {
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  .feature p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .info {
    text-align: center;
    color: white;
  }

  .info p {
    margin: 0.5rem 0;
    font-size: 1.125rem;
  }

  .info code {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
</style>
