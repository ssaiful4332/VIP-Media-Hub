import React, { useState } from "react";
import {
  Home, Search, Compass, Grid2X2, Bookmark,
  Download, History, Bell, Crown, User,
  Settings, Play, Star, Flame, ChevronRight,
  Menu, X, Globe, Film
} from "lucide-react";
import "./styles.css";

const movies = [
  { id: 1, title: "Jawan", category: "Action", year: 2023, rating: "8.5", color: "poster1" },
  { id: 2, title: "Animal", category: "Action", year: 2023, rating: "8.3", color: "poster2" },
  { id: 3, title: "Dunki", category: "Drama", year: 2023, rating: "8.1", color: "poster3" },
  { id: 4, title: "KGF Chapter 2", category: "Action", year: 2022, rating: "8.7", color: "poster4" },
  { id: 5, title: "Fighter", category: "Action", year: 2024, rating: "8.2", color: "poster5" },
  { id: 6, title: "Pushpa", category: "Drama", year: 2021, rating: "8.6", color: "poster6" }
];

const latest = [
  { id: 7, title: "New Release", category: "Drama", year: 2026, color: "poster7" },
  { id: 8, title: "The Journey", category: "Action", year: 2026, color: "poster8" },
  { id: 9, title: "Dark Mystery", category: "Thriller", year: 2026, color: "poster9" },
  { id: 10, title: "Love Story", category: "Romance", year: 2026, color: "poster10" }
];

const navigation = [
  ["Home", Home],
  ["Explore", Compass],
  ["Categories", Grid2X2],
  ["My Watchlist", Bookmark],
  ["My Downloads", Download],
  ["Watch History", History],
  ["Notifications", Bell],
  ["Membership", Crown],
  ["My Profile", User],
  ["Settings", Settings]
];

function MovieCard({ movie, onSelect }) {
  return (
    <article className="movie-card" onClick={() => onSelect(movie)}>
      <div className={`movie-poster ${movie.color}`}>
        <Film size={35} />
        <span className="movie-rating">
          <Star size={12} fill="currentColor" />
          {movie.rating || "NEW"}
        </span>
        <button className="poster-play" aria-label="Select video">
          <Play size={19} fill="currentColor" />
        </button>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.category} · {movie.year}</p>
      </div>
    </article>
  );
}

function App() {
  const [active, setActive] = useState("Home");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);

  const allMovies = [...movies, ...latest];

  const filtered = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.category.toLowerCase().includes(search.toLowerCase())
  );

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  function toggleWatchlist(movie) {
    setWatchlist(old =>
      old.some(item => item.id === movie.id)
        ? old.filter(item => item.id !== movie.id)
        : [...old, movie]
    );
  }

  return (
    <div className="vip-app">

      <header className="top-header">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className="brand">
          <div className="brand-crown"><Crown /></div>
          <div>
            <h1>VIP <span>Media Hub</span></h1>
            <small>WATCH · ENJOY · REPEAT</small>
          </div>
        </div>

        <div className="top-search">
          <Search size={19} />
          <input
            placeholder="Search movies, series..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="language">
          <Globe size={17} /> বাংলা
        </button>

        <div className="profile">
          {telegramUser?.photo_url
            ? <img src={telegramUser.photo_url} alt="Profile" />
            : <User size={20} />}
          <span>{telegramUser?.first_name || "Guest"}</span>
        </div>
      </header>

      <div className="main-layout">

        <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
          {navigation.map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-link ${active === name ? "selected" : ""}`}
              onClick={() => {
                setActive(name);
                setMenuOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
            </button>
          ))}

          <div className="sidebar-bottom">
            <Crown size={27} />
            <h3>VIP Media Hub</h3>
            <p>Premium Experience for Everyone</p>
          </div>
        </aside>

        <main className="content">

          {active === "Home" && (
            <>
              <section className="hero">
                <div className="hero-content">
                  <span className="featured">
                    <Flame size={15} /> FEATURED
                  </span>

                  <h2>YOUR CINEMA.<br />
                    <span>YOUR WORLD.</span>
                  </h2>

                  <p>Discover amazing stories and enjoy your favourite videos.</p>

                  <button
                    className="gold-button"
                    onClick={() => setSelected({
                      title: "Featured Collection",
                      category: "Featured"
                    })}
                  >
                    <Play size={17} fill="currentColor" /> Watch Now
                  </button>
                </div>

                <div className="hero-decoration">
                  <Crown size={100} />
                </div>
              </section>

              <section className="section">
                <div className="section-title">
                  <h2><Flame /> Trending Now</h2>
                  <button onClick={() => setActive("Explore")}>
                    See All <ChevronRight size={17} />
                  </button>
                </div>

                <div className="movie-grid">
                  {movies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </section>

              <section className="section">
                <div className="section-title">
                  <h2><Star /> Latest Releases</h2>
                  <button onClick={() => setActive("Explore")}>
                    See All <ChevronRight size={17} />
                  </button>
                </div>

                <div className="movie-grid">
                  {latest.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {active === "Explore" && (
            <section className="section">
              <div className="section-title">
                <h2><Compass /> Explore Videos</h2>
              </div>
              <div className="movie-grid">
                {filtered.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onSelect={setSelected} />
                ))}
              </div>
              {filtered.length === 0 && <p>No videos found.</p>}
            </section>
          )}

          {active === "Categories" && (
            <section className="section">
              <div className="section-title"><h2>Video Categories</h2></div>
              <div className="category-grid">
                {["Action", "Drama", "Romance", "Thriller", "Comedy", "Adventure"].map(category => (
                  <button key={category} onClick={() => setSearch(category)}>
                    <Film /> {category}
                  </button>
                ))}
              </div>
            </section>
          )}

          {active === "My Watchlist" && (
            <section className="section">
              <div className="section-title"><h2>My Watchlist</h2></div>
              <div className="movie-grid">
                {watchlist.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onSelect={setSelected} />
                ))}
              </div>
              {watchlist.length === 0 && <p>Your watchlist is empty.</p>}
            </section>
          )}

          {!["Home", "Explore", "Categories", "My Watchlist"].includes(active) && (
            <section className="section">
              <div className="section-title"><h2>{active}</h2></div>
              <p className="coming-soon">
                {active} section is ready for the next development stage.
              </p>
            </section>
          )}

        </main>

        <aside className="right-panel">
          <div className="panel-box">
            <h3><Play size={17} /> Continue Watching</h3>
            <div className="continue-poster">
              <Play size={27} fill="currentColor" />
            </div>
            <h4>Your next video</h4>
            <p>Continue where you left off.</p>
            <button className="gold-button full-button">Resume</button>
          </div>

          <div className="panel-box">
            <h3><Bookmark size={17} /> Your Watchlist</h3>
            <p>{watchlist.length} saved videos</p>
            <button className="outline-button" onClick={() => setActive("My Watchlist")}>
              Open Watchlist
            </button>
          </div>
        </aside>

      </div>

      <nav className="bottom-nav">
        {navigation.slice(0, 8).map(([name, Icon]) => (
          <button
            key={name}
            className={active === name ? "bottom-active" : ""}
            onClick={() => setActive(name)}
          >
            <Icon size={20} />
            <span>{name === "My Watchlist" ? "Watchlist" : name}</span>
          </button>
        ))}
      </nav>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="video-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelected(null)}>
              <X />
            </button>
            <Film size={45} />
            <h2>{selected.title}</h2>
            <p>{selected.category}</p>
            <button className="gold-button" onClick={() => toggleWatchlist(selected)}>
              <Bookmark size={17} />
              {watchlist.some(item => item.id === selected.id)
                ? "Remove from Watchlist"
                : "Add to Watchlist"}
            </button>
            <p className="modal-note">
              ভিডিও প্লেয়ার পরবর্তী উন্নয়ন ধাপে যুক্ত হবে।
            </p>
          </div>
        </div>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} VIP Media Hub · All Rights Reserved
      </footer>

    </div>
  );
}

export default App;
