const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.DB_PORT || 3000;
const nodemailer = require('nodemailer');



app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'user-id']
}))

app.use(express.json());



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'beauxbaptiste@gmail.com',
    pass: 'uxxeectijuatbsfv '
  }
});

function envoyerMail(to, subject, text) {
  const mailOptions = {
    from: 'beauxbaptiste@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    } else {
      console.log('Email envoyé : ' + info.response);
    }
  });
}



const bdd = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

bdd.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log(`Connecté à la base de données MySQL nommée : ${bdd.config.database}`);
});


function ajouterLog(action, details, userId = null) {
  const query = 'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)';
  bdd.query(query, [userId, action, details], (err) => {
    if (err) {
      console.error('Erreur lors de l\'ajout du log :', err);
    }
  });
}

app.get('/', (req, res) => {
  res.send('Connecté à l\'API');
})

app.get('/api/article', (req, res) => {
    bdd.query('SELECT * FROM article', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            res.status(500).json({ error: 'Erreur serveur' });
            return;
        }
        res.json(results);
    });
});




app.post('/api/auth/register', async (req, res) => {
    const { nom, prenom, adresse, telephone, email, password } = req.body;
    if (!nom || !prenom || !adresse || !telephone || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    try {
        bdd.query('SELECT * FROM utilisateur WHERE mail = ?', [email], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la vérification de l\'email:', err);
                res.status(500).json({ message: 'Erreur serveur' });
            }

            if (results.length > 0) {
                res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO utilisateur (nom, prenom, adresse, telephone, mail, mot_de_passe, idTypeUtilisateur) VALUES (?, ?, ?, ?, ?, ?, 2)';
            bdd.query(query, [nom, prenom, adresse, telephone, email, hashedPassword], (err, result) => {
              if (err) {
                console.error('Erreur lors de l\'inscription:', err);
                res.status(500).json({ message: 'Erreur lors de l\'inscription' });
              } else {
                ajouterLog('inscription', `Nouvel utilisateur inscrit : ${email}`, result.insertId);
                res.status(201).json({ message: 'Inscription réussie' });
              }
            });
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    bdd.query('SELECT * FROM utilisateur WHERE mail = ?', [email], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la connexion :', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const utilisateur = results[0];

        const match = await bcrypt.compare(password, utilisateur.mot_de_passe);

        if (!match) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        res.status(200).json({
          id: utilisateur.idUtilisateur,
          email: utilisateur.mail,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          idTypeUtilisateur: utilisateur.idTypeUtilisateur
        });
        ajouterLog('connexion', `Utilisateur connecté : ${email}`, utilisateur.idUtilisateur);

    });
});

const authentifierUtilisateur = (req, res, next) => {
    const userId = req.headers['user-id'];

    if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    req.userId = userId;
    next();
};



app.get('/api/articles', (req, res) => {
    bdd.query('SELECT * FROM article', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            res.status(500).json({ error: 'Erreur serveur' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/type-articles', (req, res) => {
    bdd.query('SELECT * FROM type_article', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des types d\'articles:', err);
            res.status(500).json({ error: 'Erreur serveur' });
            return;
        }
        res.json(results);
    });
})


app.get('/api/burgers', (req, res) => {
  const sql = 'SELECT * FROM article WHERE idTypeArticle = 1';
  bdd.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des burgers :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});



app.get('/api/articles-par-type/:idTypeArticle', (req, res) => {
  const { idTypeArticle } = req.params;
  bdd.query(
    'SELECT * FROM article WHERE idTypeArticle = ?',
    [idTypeArticle],
    (err, results) => {
      if (err) {
        console.error('Erreur récupération des articles par type:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    }
  );
});



app.get('/api/article/:id', (req, res) => {
  const id = req.params.id;

  const sql = 'SELECT * FROM article WHERE id = ?';
  bdd.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'article :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    res.json(results[0]);
  });
});


app.post('/api/commande', authentifierUtilisateur, (req, res) => {
  const panier = req.body.panier;
  const idUtilisateur = req.userId;

  if (!panier || !Array.isArray(panier) || panier.length === 0) {
    ajouterLog('commande', 'Panier vide ou invalide', idUtilisateur);
    return res.status(400).json({ error: 'Panier vide ou invalide' });
  }

  bdd.query('SELECT adresse FROM utilisateur WHERE idUtilisateur = ?', [idUtilisateur], (err, results) => {
    if (err) {
      ajouterLog('commande', `Erreur base de données: ${err.message}`, idUtilisateur);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    if (results.length === 0) {
      ajouterLog('commande', 'Utilisateur non trouvé', idUtilisateur);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const adresse = results[0].adresse || 'Adresse non fournie';

    let montantTotal = 0;
    panier.forEach(item => {
      const prix = parseFloat(item.prix);
      const quantite = item.quantite || 1;
      if (!isNaN(prix)) {
        montantTotal += prix * quantite;
      }
    });
    montantTotal = montantTotal.toFixed(2);

    const sqlInsertCommande = 'INSERT INTO commande (date_commande, statut, adresse, montant, idUtilisateur) VALUES (NOW(), "en attente", ?, ?, ?)';
    bdd.query(sqlInsertCommande, [adresse, montantTotal, idUtilisateur], (err, result) => {
      if (err) {
        ajouterLog('commande', `Erreur création commande: ${err.message}`, idUtilisateur);
        return res.status(500).json({ error: 'Erreur création commande' });
      }

      const idCommande = result.insertId;
      ajouterLog('commande', `Commande créée (idCommande=${idCommande}, montant=${montantTotal})`, idUtilisateur);

      // Compter lignes
      let nbLignes = 0;
      panier.forEach(item => {
        if (item.type === 'menu') {
          nbLignes++;
          if (item.contenu) {
            if (item.contenu.burger && item.contenu.burger.id) nbLignes++;
            if (item.contenu.boisson && item.contenu.boisson.id) nbLignes++;
            if (item.contenu.frite && item.contenu.frite.id) nbLignes++;
          }
        } else {
          nbLignes++;
        }
      });

      if (nbLignes === 0) {
        ajouterLog('commande', `Commande sans lignes (idCommande=${idCommande})`, idUtilisateur);
        return res.status(201).json({
          message: 'Commande créée sans lignes',
          idCommande,
          montant: montantTotal,
        });
      }

      let lignesInsertees = 0;
      let erreurInsertion = false;

      function ligneTerminee() {
        lignesInsertees++;
        if (lignesInsertees === nbLignes) {
          if (erreurInsertion) {
            ajouterLog('commande', `Erreur lors insertion lignes commande (idCommande=${idCommande})`, idUtilisateur);
            return res.status(500).json({ error: 'Erreur lors insertion lignes commande' });
          }
          ajouterLog('commande', `Toutes les lignes insérées (idCommande=${idCommande})`, idUtilisateur);
          return res.status(201).json({
            message: 'Commande créée avec succès',
            idCommande,
            montant: montantTotal,
          });
        }
      }

      panier.forEach(item => {
        const quantite = item.quantite || 1;

        if (item.type === 'menu') {
          bdd.query(
            'SELECT m.idMenu FROM menu m JOIN type_menu tm ON m.idTypeMenu = tm.id WHERE tm.libel = ? LIMIT 1',
            [item.taille],
            (err, menus) => {
              if (err) {
                erreurInsertion = true;
                ajouterLog('commande', `Erreur récupération idMenu: ${err.message}`, idUtilisateur);
                ligneTerminee(); ligneTerminee(); ligneTerminee(); ligneTerminee();
                return;
              }
              const idMenu = menus.length > 0 ? menus[0].idMenu : null;

              bdd.query(
                'INSERT INTO ligne_commande (quantite, idCommande, idArticle, idMenu) VALUES (?, ?, NULL, ?)',
                [quantite, idCommande, idMenu],
                (err) => {
                  if (err) {
                    erreurInsertion = true;
                    ajouterLog('commande', `Erreur insertion ligne menu (idCommande=${idCommande}): ${err.message}`, idUtilisateur);
                  } else {
                    ajouterLog('commande', `Ligne menu insérée (idCommande=${idCommande}, idMenu=${idMenu})`, idUtilisateur);
                  }
                  ligneTerminee();
                }
              );

              // burger
              if (item.contenu && item.contenu.burger && item.contenu.burger.id) {
                bdd.query(
                  'INSERT INTO ligne_commande (quantite, idCommande, idArticle, idMenu) VALUES (?, ?, ?, NULL)',
                  [quantite, idCommande, item.contenu.burger.id],
                  (err) => {
                    if (err) {
                      erreurInsertion = true;
                      ajouterLog('commande', `Erreur insertion ligne burger (idCommande=${idCommande}): ${err.message}`, idUtilisateur);
                    } else {
                      ajouterLog('commande', `Ligne burger insérée (idCommande=${idCommande}, idArticle=${item.contenu.burger.id})`, idUtilisateur);
                    }
                    ligneTerminee();
                  }
                );
              } else {
                ligneTerminee();
              }

              // boisson
              if (item.contenu && item.contenu.boisson && item.contenu.boisson.id) {
                bdd.query(
                  'INSERT INTO ligne_commande (quantite, idCommande, idArticle, idMenu) VALUES (?, ?, ?, NULL)',
                  [quantite, idCommande, item.contenu.boisson.id],
                  (err) => {
                    if (err) {
                      erreurInsertion = true;
                      ajouterLog('commande', `Erreur insertion ligne boisson (idCommande=${idCommande}): ${err.message}`, idUtilisateur);
                    } else {
                      ajouterLog('commande', `Ligne boisson insérée (idCommande=${idCommande}, idArticle=${item.contenu.boisson.id})`, idUtilisateur);
                    }
                    ligneTerminee();
                  }
                );
              } else {
                ligneTerminee();
              }

              // frite
              if (item.contenu && item.contenu.frite && item.contenu.frite.id) {
                bdd.query(
                  'INSERT INTO ligne_commande (quantite, idCommande, idArticle, idMenu) VALUES (?, ?, ?, NULL)',
                  [quantite, idCommande, item.contenu.frite.id],
                  (err) => {
                    if (err) {
                      erreurInsertion = true;
                      ajouterLog('commande', `Erreur insertion ligne frite (idCommande=${idCommande}): ${err.message}`, idUtilisateur);
                    } else {
                      ajouterLog('commande', `Ligne frite insérée (idCommande=${idCommande}, idArticle=${item.contenu.frite.id})`, idUtilisateur);
                    }
                    ligneTerminee();
                  }
                );
              } else {
                ligneTerminee();
              }
            }
          );
        } else {
          const idArticle = item.id || item.idArticle || null;
          if (!idArticle) {
            ligneTerminee();
            return;
          }

          bdd.query(
            'INSERT INTO ligne_commande (quantite, idCommande, idArticle, idMenu) VALUES (?, ?, ?, NULL)',
            [quantite, idCommande, idArticle],
            (err) => {
              if (err) {
                erreurInsertion = true;
                ajouterLog('commande', `Erreur insertion ligne article (idCommande=${idCommande}): ${err.message}`, idUtilisateur);
              } else {
                ajouterLog('commande', `Ligne article insérée (idCommande=${idCommande}, idArticle=${idArticle})`, idUtilisateur);
              }
              ligneTerminee();
            }
          );
        }
      });
    });
  });
});



// Route pour récupérer les commandes d'un utilisateur
app.get('/api/commandes', authentifierUtilisateur, (req, res) => {
    const idUtilisateur = req.userId;
    
    const query = `
        SELECT c.*, 
               GROUP_CONCAT(a.nom SEPARATOR ', ') as articles
        FROM commande c
        LEFT JOIN ligne_commande lc ON c.idCommande = lc.idCommande
        LEFT JOIN article a ON lc.idArticle = a.id
        WHERE c.idUtilisateur = ?
        GROUP BY c.idCommande
        ORDER BY c.date_commande DESC
    `;
    
    bdd.query(query, [idUtilisateur], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des commandes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json(results);
    });
});


app.get('/api/commandes/simples', authentifierUtilisateur, (req, res) => {
  const idUtilisateur = req.userId;

  const sql = `
    SELECT c.*
    FROM commande c
    WHERE c.idUtilisateur = ?
      AND NOT EXISTS (
        SELECT 1
        FROM ligne_commande lc
        WHERE lc.idCommande = c.idCommande
          AND lc.idMenu IS NOT NULL
      )
  `;

  bdd.query(sql, [idUtilisateur], (err, results) => {
    if (err) {
      console.error('Erreur récupération commandes simples:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});


app.get('/api/commande/:idCommande', authentifierUtilisateur, (req, res) => {
  const idCommande = req.params.idCommande;
  const idUtilisateur = req.userId;

  const sqlCommande = 'SELECT * FROM commande WHERE idCommande = ? AND idUtilisateur = ?';
  bdd.query(sqlCommande, [idCommande, idUtilisateur], (err, commandes) => {
    if (err) {
      console.error('Erreur récupération commande:', err);
      return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
    }
    if (commandes.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const commande = commandes[0];

    const sqlLignes = `
      SELECT 
        lc.idLigneCommande,
        lc.quantite,
        lc.idArticle,
        lc.idMenu,
        a.nom AS nomArticle,
        m.nom AS nomMenu,
        tm.libel AS typeMenu
      FROM ligne_commande lc
      LEFT JOIN article a ON lc.idArticle = a.id
      LEFT JOIN menu m ON lc.idMenu = m.idMenu
      LEFT JOIN type_menu tm ON m.idTypeMenu = tm.id
      WHERE lc.idCommande = ?
    `;

    bdd.query(sqlLignes, [idCommande], (err, lignes) => {
      if (err) {
        console.error('Erreur récupération lignes commande:', err);
        return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
      }

      const articles = lignes.map(ligne => ({
        idLigneCommande: ligne.idLigneCommande,
        quantite: ligne.quantite,
        type: ligne.idMenu ? 'menu' : 'article',
        nom: ligne.idMenu ? ligne.nomMenu : ligne.nomArticle,
        idArticle: ligne.idArticle,
        idMenu: ligne.idMenu,
        typeMenu: ligne.typeMenu || null
      }));

      res.json({
        idCommande: commande.idCommande,
        date_commande: commande.date_commande,
        statut: commande.statut,
        adresse: commande.adresse,
        montant: commande.montant,
        articles
      });
    });
  });
});

// Route pour récupérer toutes les commandes avec leurs lignes (articles et menus)
app.get('/api/commandes/toutes', (req, res) => {
  const sql = `
    SELECT 
      c.idCommande,
      c.date_commande,
      c.statut,
      c.adresse,
      c.montant,
      c.idUtilisateur,
      GROUP_CONCAT(DISTINCT a.nom SEPARATOR ', ') AS articles,
      GROUP_CONCAT(DISTINCT m.nom SEPARATOR ', ') AS menus
    FROM commande c
    LEFT JOIN ligne_commande lc ON c.idCommande = lc.idCommande
    LEFT JOIN article a ON lc.idArticle = a.id
    LEFT JOIN menu m ON lc.idMenu = m.idMenu
    GROUP BY c.idCommande
    ORDER BY c.date_commande DESC
  `;

  bdd.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de toutes les commandes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});


app.put('/api/commandes/:id/statut', (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  const sql = 'UPDATE commande SET statut = ? WHERE idCommande = ?';
  bdd.query(sql, [statut, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du statut :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Si le statut devient "prête", envoie un email à l'utilisateur
    if (statut === 'prête') {
      const sqlMail = `
        SELECT u.mail, u.prenom 
        FROM commande c 
        JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur 
        WHERE c.idCommande = ?`;
      
      bdd.query(sqlMail, [id], (err2, results) => {
        if (err2 || results.length === 0) {
          console.error('Erreur récupération email:', err2);
          return res.status(500).json({ error: 'Erreur récupération email' });
        }
        const { mail, prenom } = results[0];
        const message = `Bonjour ${prenom},\n\nVotre commande n°${id} est prête !\nMerci pour votre confiance.\n\nL'équipe McBo 🍔`;
        envoyerMail(mail, 'Votre commande est prête !', message);
      });
    }

    res.json({ message: 'Statut mis à jour avec succès' });
  });
});


app.listen(port, () => {
    console.log(`Serveur backend démarré sur http://${bdd.config.host}:${port}`);
    console.log(`Mise à jour faite le : ${new Date().toLocaleString()}`);
});
