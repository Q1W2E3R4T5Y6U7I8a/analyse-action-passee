const Insights = () => {
  return (
    <div style={styles.body}>
      <div style={styles.quote}>
        Il est impossible de faire plus que ta capacité. Les pensées conscientes ne sont que 0.0001%.<br />
        Donc, gérer tout ce qui entoure le travail (repos, pensées, méditation, etc.) est aussi important que le "vrai" travail ou l'éducation.
      </div>

      <div style={styles.header}>
        <h1>2 Livres le plus important pour grandir a la vie</h1>
        <p>Si tu veux obtenir liberte et toucher le Dieux, il fait d'avoir les amis et pouvouir</p>
      </div>

      <div style={styles.container}>
        {/* Dale Carnegie Book */}
        <div style={styles.bookSection}>
          <div style={styles.bookTitle}>
            <i className="fas fa-handshake" style={styles.bookIcon}></i>
            <h2>Comment se faire des amis - Dale Carnegie</h2>
          </div>
          
          <h3 style={styles.sectionTitle}>Principes Fondamentaux</h3>
          <ul style={styles.rulesList}>
            <li><span style={styles.highlight}>Évitez la critique directe</span> → attaquer détruit la coopération</li>
            <li><span style={styles.highlight}>Appréciez sincèrement</span> → tout le monde veut se sentir important</li>
            <li><span style={styles.highlight}>Comprendre l'autre avant de convaincre</span> → empathie</li>
            <li><span style={styles.highlight}>Souriez et soyez authentique</span></li>
            <li><span style={styles.highlight}>Retenez les noms</span> → importance personnelle</li>
            <li><span style={styles.highlight}>Écoutez activement</span></li>
            <li><span style={styles.highlight}>Parlez des centres d'intérêt de l'autre</span></li>
            <li><span style={styles.highlight}>Montrez que vous comprenez ses besoins</span></li>
            <li><span style={styles.highlight}>Faites-le sentir apprécié immédiatement</span></li>
          </ul>
          
          <div style={styles.quote}>
            "Le désir d'être important est le désir le plus profond qui caractérise la nature humaine." - Dale Carnegie
          </div>
          
          <h3 style={styles.sectionTitle}>Corrélations avec Warcraft 3 et Poker</h3>
          <table style={styles.correlationTable}>
            <thead>
              <tr>
                <th>Règle</th>
                <th>Warcraft 3</th>
                <th>Poker</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ne pas critiquer</td>
                <td>Dans une team, ne blâmez pas un joueur pour une erreur ; proposez un plan pour la prochaine bataille</td>
                <td>Pas d'ego battle à table, restez calme face aux bluffs</td>
              </tr>
              <tr>
                <td>Apprécier sincèrement</td>
                <td>Remerciez le joueur qui scoute ou sauve vos unités</td>
                <td>Encourager & sourire → Maintient une image friendly, évite qu'on vous cible</td>
              </tr>
              <tr>
                <td>Faire croire que l'idée vient de l'autre</td>
                <td>Suggérez subtilement un creep route et laissez le coéquipier le proposer "officiellement"</td>
                <td>Donner l'impression qu'ils contrôlent → Laissez-les "mener" la hand pour mieux les piéger</td>
              </tr>
              <tr>
                <td>Encourager les progrès</td>
                <td>Félicitez une bonne défense même si la game est perdue</td>
                <td>Avouer vos erreurs → Montrez un misplay volontairement pour brouiller votre image</td>
              </tr>
              <tr>
                <td>Lire les besoins & émotions</td>
                <td>Comprendre les objectifs de chaque joueur dans l'équipe</td>
                <td>Comprendre qui joue pour l'argent, qui joue pour l'ego</td>
              </tr>
            </tbody>
          </table>
          
          <h3 style={styles.sectionTitle}>Stratégies Avancées</h3>
          <ul style={styles.rulesList}>
            <li><span style={styles.highlight}>Évitez la confrontation frontale</span></li>
            <li><span style={styles.highlight}>Reconnaissez vos torts rapidement</span></li>
            <li><span style={styles.highlight}>Obtenez des "oui" successifs</span></li>
            <li><span style={styles.highlight}>Laissez l'autre s'exprimer</span></li>
            <li><span style={styles.highlight}>Donnez l'impression que l'idée vient de lui</span></li>
            <li><span style={styles.highlight}>Montrez comment il gagne aussi</span></li>
            <li><span style={styles.highlight}>Appel aux valeurs universelles</span></li>
            <li><span style={styles.highlight}>Créez l'enthousiasme pour agir</span></li>
          </ul>
        </div>
        
        {/* 48 Lois du Pouvoir */}
        <div style={styles.bookSection}>
          <div style={styles.bookTitle}>
            <i className="fas fa-crown" style={styles.bookIcon}></i>
            <h2>Les 48 Lois du Pouvoir - Robert Greene</h2>
          </div>
          
          <h3 style={styles.sectionTitle}>Lois Fondamentales</h3>
          <ul style={styles.rulesList}>
            <li><span style={styles.highlight}>Ne rivalisez jamais avec quelqu'un qui n'a rien à perdre</span></li>
            <li><span style={styles.highlight}>Dites-en toujours moins que nécessaire</span> → Plus vous parlez, plus vous semblez banal</li>
            <li><span style={styles.highlight}>Protégez votre réputation à tout prix</span></li>
            <li><span style={styles.highlight}>Attirez l'attention à tout prix</span></li>
            <li><span style={styles.highlight}>Agissez, ne parlez pas</span> → Seules les actions comptent</li>
            <li><span style={styles.highlight}>Soyez toujours modeste</span></li>
            <li><span style={styles.highlight}>Ne vous attendez jamais à de la loyauté</span> → Les gens sont motivés par le profit</li>
          </ul>
          
          <div style={styles.quote}>
            "Le pouvoir n'est pas quelque chose qu'on vous donne, mais quelque chose que vous prenez." - Robert Greene
          </div>
          
          <h3 style={styles.sectionTitle}>Notes Personnelles & Analyses</h3>
          <div style={styles.notesSection}>
            <div style={styles.notesGrid}>
              <div style={styles.noteCard}>
                <h4><i className="fas fa-magic" style={styles.noteIcon}></i> Aura</h4>
                <ul>
                  <li>Être toujours modeste</li>
                  <li>N'attendez jamais de loyauté - les gens sont motivés par le profit</li>
                  <li>Ne dites pas ce que vous voulez - exprimez-vous par blague ou simplification</li>
                  <li>Maintenez une apparence ferme mais pas pour dissimuler vos intentions</li>
                  <li>Protégez votre réputation à tout prix</li>
                  <li>La réputation nécessite d'être visible</li>
                </ul>
              </div>
              
              <div style={styles.noteCard}>
                <h4><i className="fas fa-brain" style={styles.noteIcon}></i> Sagesse</h4>
                <ul>
                  <li>Diriger et bâtir avec les mains des autres</li>
                  <li>Combattre toujours sur votre terrain</li>
                  <li>Ne parlez pas avec les gens stupides ou malheureux</li>
                  <li>Soyez irresponsable quand nécessaire (ex: DUMY et TOP)</li>
                  <li>Comptez sur l'intérêt personnel, pas le bonheur</li>
                  <li>Rester presque toujours neutre</li>
                  <li>Jouer le naïf pour manœuvrer</li>
                </ul>
              </div>
              
              <div style={styles.noteCard}>
                <h4><i className="fas fa-chess" style={styles.noteIcon}></i> Stratégie</h4>
                <ul>
                  <li>Concentrez vos forces</li>
                  <li>Soyez un espion quand nécessaire</li>
                  <li>Écrasez complètement vos ennemis</li>
                  <li>Laissez les autres faire le travail mais prenez le crédit</li>
                  <li>Créez un spectacle pour attirer l'attention</li>
                  <li>Faites semblant de vouloir quelque chose pour cacher vos véritables intentions</li>
                </ul>
              </div>
              
              <div style={styles.noteCard}>
                <h4><i className="fas fa-balance-scale" style={styles.noteIcon}></i> Équilibre</h4>
                <ul>
                  <li>Parlez avec des actions, pas des mots</li>
                  <li>Soyez généreux et honnête seulement si cela sert un intérêt futur</li>
                  <li>Restez silencieux et absent quand nécessaire</li>
                  <li>Ne faites jamais paraître les autres stupides</li>
                  <li>Ne critiquez personne à part vous-même</li>
                  <li>Gardez toujours une porte de sortie</li>
                </ul>
              </div>
            </div>
          </div>
          
          <h3 style={styles.sectionTitle}>Corrélations avec Warcraft 3 et Poker</h3>
          <table style={styles.correlationTable}>
            <thead>
              <tr>
                <th>Loi</th>
                <th>Warcraft 3</th>
                <th>Poker</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Protégez votre réputation</td>
                <td>Maintenez un statut de joueur fiable et compétent</td>
                <td>Construisez une image de table cohérente</td>
              </tr>
              <tr>
                <td>Dites-en moins que nécessaire</td>
                <td>Ne révélez pas vos stratégies dans le chat</td>
                <td>Ne parlez pas de vos mains ou stratégies</td>
              </tr>
              <tr>
                <td>Agissez, ne parlez pas</td>
                <td>Montrez votre compétence par le gameplay, pas les mots</td>
                <td>Vos actions à table parlent plus que vos mots</td>
              </tr>
              <tr>
                <td>Soyez irresponsable quand nécessaire</td>
                <td>Laissez un allié prendre le blâme pour une défaite</td>
                <td>Feignez une erreur pour tromper vos adversaires</td>
              </tr>
              <tr>
                <td>Concentrez vos forces</td>
                <td>Focus sur un timing push plutôt qu'une attaque dispersée</td>
                <td>Misez fort quand vous avez l'avantage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={styles.footer}>
        <p>Si tu ne fait pas ca au debut tu est foutu... Justement imaginer que tu faire le contraire</p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  body: {
    background: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)',
    color: '#f0f0f0',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    overflowX: 'hidden',
  },
  header: {
    textAlign: 'center',
    padding: '30px 20px',
    marginBottom: '30px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    gap: '30px',
    maxWidth: '1600px',
    margin: '0 auto',
    flexDirection: window.innerWidth <= 1100 ? 'column' : 'row',
  },
  bookSection: {
    flex: 1,
    background: 'rgba(30, 30, 40, 0.85)',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    opacity: 1,
    transform: 'translateY(0)',
  },
  bookTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid rgba(100, 150, 255, 0.5)',
  },
  bookIcon: {
    fontSize: '2.5rem',
    color: '#ff7b54',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    margin: '25px 0 15px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(100, 150, 255, 0.3)',
    color: '#64a0ff',
  },
  rulesList: {
    listStyleType: 'none',
    paddingLeft: '20px',
  },
  highlight: {
    background: 'rgba(255, 123, 84, 0.2)',
    padding: '2px 5px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  quote: {
    fontStyle: 'italic',
    padding: '15px',
    margin: '20px 0',
    borderLeft: '3px solid #ff7b54',
    background: 'rgba(20, 20, 30, 0.5)',
    borderRadius: '0 8px 8px 0',
  },
  correlationTable: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0',
    background: 'rgba(20, 20, 30, 0.7)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  notesSection: {
    marginTop: '30px',
    padding: '20px',
    background: 'rgba(20, 25, 40, 0.7)',
    borderRadius: '10px',
    borderLeft: '4px solid #ff7b54',
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '15px',
  },
  noteCard: {
    background: 'rgba(30, 35, 50, 0.8)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(100, 150, 255, 0.2)',
    transition: 'transform 0.3s ease',
  },
  noteIcon: {
    marginRight: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px',
    color: '#a0a0c0',
    fontSize: '0.9rem',
  },
};

export default Insights;