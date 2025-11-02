import React, { useEffect } from "react";
import "./Constitution.scss";

function Constitution() {
  useEffect(() => {
    const sections = document.querySelectorAll(".element-section");
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
      }, 300 * index);
    });

    const onScroll = () => {
      const scrollY = window.scrollY;
      const header = document.querySelector(".header");
      if (header) header.style.backgroundPositionY = `-${scrollY * 0.2}px`;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="constitution">
        <div className="header">
        <p>{`Peur de perdre > paresse > motivation > discipline > obsession`}</p>
        </div>

      <div className="container">

        {/* L’air */}
        <section className="element-section air">
          <div className="element-header">
            <i className="fas fa-wind"></i>
            <h2>L’air</h2>
          </div>
          <ul className="principle-list">
            <li>1. Tu sais que tu ne sais rien.</li>
            <li>1.1 Tu es déjà mort.</li>
            <li>
              1.2 Avant ta mort, t'attends l’infinité, je crois pas que je pourrais être “effacé” de ce monde.
            </li>
            <li>
              1.3 C’est presque sûr que tu peux affecter cette infinité et qu’avant cette vie tu as eu aussi, qui tu es maintenant c’est pas seulement le decisions de ta vie correspondant.
            </li>
            <li>1.4 T’es responsable de ton destin.</li>
            <li>
              1.4.1 Ceci est le plus controversé, mais c’est sûr que je choisir à le croire.
            </li>
          </ul>
        </section>

        {/* Le feu */}
        <section className="element-section fire">
          <div className="element-header">
            <i className="fas fa-fire"></i>
            <h2>Le feu</h2>
          </div>
          <ul className="principle-list">
            <li>2. L’amour est le plus important.</li>
            <li>2.1 Ta fille Sophia, c’est à qui tu serves ta vie, jamais à toi-même.</li>
            <li>2.2 Reste doux et attentive avec ta femme</li>
            <li>
              2.2.1 Il faut trouver le fille quel tu admirais, au moins elle doit avoir ton IQ et capacité de penser critiquement
            </li>
            <li>
              2.2.2 Faire le mini contract avec ta femme et parle de tout que vous voulez come ceci{" "}
              <a href="https://t.me/c/2993781062/10" target="_blank" rel="noopener noreferrer">
                https://t.me/c/2993781062/10
              </a>
            </li>
          </ul>
        </section>

        {/* La terre */}
        <section className="element-section earth">
          <div className="element-header">
            <i className="fas fa-mountain"></i>
            <h2>La terre</h2>
          </div>
          <ul className="principle-list">
            <li>3. Tu es un homme, tu es responsable pour tout.</li>
            <li>3.1 Tu dois obtenir liberté financière, sans ça presque rien ne compte pas.</li>
            <li>3.2 Voix basse, tête calme, bouche silencieuse.</li>
            <li>3.3 DUMY</li>
            <li>3.3.1 DUMYKAVA</li>
            <li>3.3.2 ENGLISH CLUB</li>
            <li>3.3.3 TOP</li>
            <li>3.4 Dans 23-28 ans, concentre-toi sur l’invisible que les autres ignorent.</li>
            <li>3.4.1 Ils se focalisent trop sur le matériel et le résultat immédiat. Pense à long terme.</li>
          </ul>
        </section>

        {/* L’eau */}
        <section className="element-section water">
          <div className="element-header">
            <i className="fas fa-tint"></i>
            <h2>L’eau</h2>
          </div>
          <ul className="principle-list">
            <li>4. Aime toi-même et tes règles du jeu.</li>
            <li>4.1 C'est toi qui a crée ce jeu et les règles</li>
            <li>4.2 Tout est interconnecté</li>
          </ul>
        </section>

        {/* Habitudes */}
        <section className="element-section habits">
          <div className="element-header">
            <i className="fas fa-pray"></i>
            <h2>Habitudes</h2>
          </div>
          <ul className="principle-list">
            <li>5. Dire mercy à Dieu</li>
          </ul>
        </section>
      </div>

      <footer className="footer">
        <p></p>
      </footer>
    </div>
  );
}

export default Constitution;
