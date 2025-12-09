import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// --- CONFIGURACIÓN DE LA URL DEL BACKEND (AZURE) ---
// Esta es la dirección de tu cerebro PHP en la nube.
// Si tu App Service se llama diferente, cambia "api-perritos-dani" por tu nombre real.
const API_URL = "https://api-perritos-dani.azurewebsites.net/index.php/dogs";

// --- COMPONENTE: DETALLE DEL PERRITO ---
const DogDetail = ({ favorites, toggleFavorite }) => {
  const { id } = useParams();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [form, setForm] = useState({ name: '', email: '', phone: '', msg: '' });

  useEffect(() => {
    // Petición al backend en Azure
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        setDog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando perro:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`¡Gracias ${form.name}! Tu solicitud para adoptar a ${dog.nombre} ha sido enviada.`);
  };

  if (loading) return <div style={{padding: '20px'}}>Cargando datos desde Azure...</div>;
  if (!dog || dog.error) return <div style={{padding: '20px'}}>Perrito no encontrado</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <Link to="/" style={{ textDecoration: 'none', fontSize: '18px', color: '#0078d4' }}>← Volver a la lista</Link>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
        {/* Foto Grande */}
        <img src={dog.imagen} alt={dog.nombre} style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
        
        <div style={{ flex: 1 }}>
          <h1 style={{ marginTop: 0, color: '#333' }}>{dog.nombre}</h1>
          <p style={{ fontSize: '1.1rem', color: '#555' }}>{dog.descripcion}</p>
          
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6' }}>
             <li>📍 <strong>Ciudad:</strong> {dog.ciudad}</li>
             <li>📏 <strong>Tamaño:</strong> {dog.tamano}</li>
             <li>🎂 <strong>Edad:</strong> {dog.edad} años</li>
          </ul>

          <div style={{ marginBottom: '20px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {parseInt(dog.vacunado) === 1 && <span style={tagStyle}>✅ Vacunado</span>}
            {parseInt(dog.esterilizado) === 1 && <span style={tagStyle}>✅ Esterilizado</span>}
            {parseInt(dog.discapacidad) === 1 && <span style={tagStyle}>♿ Cuidados Especiales</span>}
          </div>

          <button onClick={() => toggleFavorite(dog.id)} style={btnStyle}>
            {favorites.includes(dog.id) ? "♥ Quitar de Favoritos" : "♡ Añadir a Favoritos"}
          </button>
        </div>
      </div>

      {/* Formulario de adopción */}
      <div style={{ marginTop: '40px', background: '#f9f9f9', padding: '25px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0 }}>¿Te interesa adoptar a {dog.nombre}?</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Tu Nombre" required 
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
            style={inputStyle}
          />
          <input 
            placeholder="Email" type="email" required 
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
            style={inputStyle}
          />
          <input 
            placeholder="Teléfono" type="tel" required 
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
            style={inputStyle}
          />
          <textarea 
            placeholder="Mensaje (opcional)" 
            value={form.msg} onChange={e => setForm({...form, msg: e.target.value})} 
            style={{...inputStyle, height: '80px', fontFamily: 'inherit'}}
          />
          <button type="submit" style={{...btnStyle, background: '#28a745', color: 'white', border: 'none', fontSize: '1rem'}}>
            Enviar Solicitud de Adopción
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE: LISTA PRINCIPAL (HOME) ---
const Home = ({ favorites, toggleFavorite }) => {
  const [dogs, setDogs] = useState([]);
  const [filterCity, setFilterCity] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Petición al backend en Azure
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDogs(data);
        } else {
          console.error("Formato de datos incorrecto:", data);
        }
      })
      .catch(err => {
        console.error("Error conectando a Azure:", err);
        setError("No se pudo conectar con el servidor. Verifica que el Backend esté activo.");
      });
  }, []);

  // Lógica de Filtros
  const filteredDogs = dogs.filter(dog => {
    const matchCity = dog.ciudad.toLowerCase().includes(filterCity.toLowerCase());
    const matchFav = showFavoritesOnly ? favorites.includes(dog.id) : true;
    return matchCity && matchFav;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🐶 Adopta un Perrito</h1>
      
      {error && <div style={{background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', textAlign: 'center'}}>{error}</div>}

      {/* Contadores */}
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span>Total: <strong>{dogs.length}</strong></span>
        <span>Disponibles: <strong>{filteredDogs.length}</strong></span>
        <span>Favoritos: <strong>{favorites.length}</strong></span>
      </div>

      {/* Controles de Filtro */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <input 
          placeholder="🔍 Filtrar por ciudad..." 
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={{ ...btnStyle, background: showFavoritesOnly ? '#ff4081' : '#eee', color: showFavoritesOnly ? 'white' : '#333', border: 'none' }}
        >
          {showFavoritesOnly ? "★ Ver Todos" : "☆ Ver Solo Favoritos"}
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {filteredDogs.map(dog => (
          <div key={dog.id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', background: 'white', transition: 'transform 0.2s' }}>
            <img src={dog.imagen} alt={dog.nombre} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{dog.nombre}</h2>
              <p style={{ margin: '0 0 15px 0', color: '#666' }}>{dog.ciudad} • {dog.tamano}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/dog/${dog.id}`} style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                  Ver Detalle
                </Link>
                <button onClick={() => toggleFavorite(dog.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#ff4081' }}>
                  {favorites.includes(dog.id) ? "♥" : "♡"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  // Estado de favoritos persistente en localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    const dogId = parseInt(id);
    setFavorites(prev => 
      prev.includes(dogId) ? prev.filter(f => f !== dogId) : [...prev, dogId]
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/dog/:id" element={<DogDetail favorites={favorites} toggleFavorite={toggleFavorite} />} />
      </Routes>
    </BrowserRouter>
  );
}

// Estilos base
const btnStyle = { padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff', fontSize: '0.9rem', fontWeight: 'bold' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem' };
const tagStyle = { background: '#e9ecef', color: '#495057', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', marginRight: '5px', display: 'inline-block', marginBottom: '5px' };

export default App;
