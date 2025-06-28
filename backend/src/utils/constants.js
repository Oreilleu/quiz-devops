// src/utils/constants.js

const QUESTION_CATEGORIES = {
    'général': 'Culture générale',
    'science': 'Sciences et technologie',
    'histoire': 'Histoire mondiale',
    'géographie': 'Géographie mondiale',
    'sport': 'Sports et jeux olympiques',
    'cinéma': 'Cinéma et télévision',
    'musique': 'Musique et artistes',
    'littérature': 'Littérature française et mondiale'
};

const GAME_CONFIG = {
    MIN_PLAYERS: 1,
    MAX_PLAYERS: 10,
    DEFAULT_QUESTIONS: 10,
    QUESTION_TIME_LIMIT: 15, // secondes
    BETWEEN_QUESTIONS_DELAY: 3, // secondes
    GAME_START_COUNTDOWN: 3 // secondes
};

const FALLBACK_QUESTIONS = {
    général: [
        {
            question: "Quelle est la capitale de la France ?",
            options: ["Lyon", "Marseille", "Paris", "Toulouse"],
            correct: 2,
            explanation: "Paris est la capitale de la France depuis le Moyen Âge."
        },
        {
            question: "Combien y a-t-il de continents ?",
            options: ["5", "6", "7", "8"],
            correct: 2,
            explanation: "Il y a 7 continents : Afrique, Amérique du Nord, Amérique du Sud, Antarctique, Asie, Europe, Océanie."
        },
        {
            question: "Quel est le plus grand océan du monde ?",
            options: ["Atlantique", "Indien", "Arctique", "Pacifique"],
            correct: 3,
            explanation: "L'océan Pacifique couvre environ un tiers de la surface terrestre."
        },
        {
            question: "En quelle année a eu lieu la Révolution française ?",
            options: ["1789", "1792", "1799", "1804"],
            correct: 0,
            explanation: "La Révolution française a commencé en 1789 avec la prise de la Bastille."
        },
        {
            question: "Quel est l'élément chimique de symbole 'O' ?",
            options: ["Or", "Oxygène", "Osmium", "Oxyde"],
            correct: 1,
            explanation: "O est le symbole chimique de l'oxygène."
        },
        {
            question: "Qui a peint la Joconde ?",
            options: ["Picasso", "Van Gogh", "Leonardo da Vinci", "Monet"],
            correct: 2,
            explanation: "Leonardo da Vinci a peint la Joconde entre 1503 et 1519."
        },
        {
            question: "Quelle est la planète la plus proche du Soleil ?",
            options: ["Vénus", "Mercure", "Mars", "Terre"],
            correct: 1,
            explanation: "Mercure est la planète la plus proche du Soleil dans notre système solaire."
        },
        {
            question: "Dans quel pays se trouve Machu Picchu ?",
            options: ["Bolivie", "Chili", "Pérou", "Équateur"],
            correct: 2,
            explanation: "Machu Picchu est une ancienne cité inca située au Pérou."
        }
    ],

    science: [
        {
            question: "Quelle est la formule chimique de l'eau ?",
            options: ["H2O", "CO2", "O2", "H2SO4"],
            correct: 0,
            explanation: "L'eau est composée de deux atomes d'hydrogène et un atome d'oxygène."
        },
        {
            question: "Combien d'os y a-t-il dans le corps humain adulte ?",
            options: ["196", "206", "216", "226"],
            correct: 1,
            explanation: "Un adulte possède 206 os, contre 270 à la naissance."
        },
        {
            question: "Quelle est la vitesse de la lumière dans le vide ?",
            options: ["300 000 km/s", "150 000 km/s", "500 000 km/s", "100 000 km/s"],
            correct: 0,
            explanation: "La vitesse de la lumière dans le vide est d'environ 299 792 458 m/s."
        },
        {
            question: "Quel gaz représente 78% de l'atmosphère terrestre ?",
            options: ["Oxygène", "Azote", "Argon", "Dioxyde de carbone"],
            correct: 1,
            explanation: "L'azote (N2) représente environ 78% de l'atmosphère terrestre."
        }
    ],

    histoire: [
        {
            question: "En quelle année a eu lieu la chute du mur de Berlin ?",
            options: ["1987", "1988", "1989", "1990"],
            correct: 2,
            explanation: "Le mur de Berlin est tombé le 9 novembre 1989."
        },
        {
            question: "Qui était le premier empereur romain ?",
            options: ["Jules César", "Auguste", "Néron", "Trajan"],
            correct: 1,
            explanation: "Auguste (Octave) fut le premier empereur romain en 27 av. J.-C."
        },
        {
            question: "En quelle année a commencé la Première Guerre mondiale ?",
            options: ["1913", "1914", "1915", "1916"],
            correct: 1,
            explanation: "La Première Guerre mondiale a commencé le 28 juillet 1914."
        }
    ],

    géographie: [
        {
            question: "Quel est le plus long fleuve du monde ?",
            options: ["Amazone", "Nil", "Mississippi", "Yangtsé"],
            correct: 1,
            explanation: "Le Nil, avec ses 6 650 km, est considéré comme le plus long fleuve du monde."
        },
        {
            question: "Quelle est la capitale de l'Australie ?",
            options: ["Sydney", "Melbourne", "Canberra", "Perth"],
            correct: 2,
            explanation: "Canberra est la capitale de l'Australie depuis 1913."
        },
        {
            question: "Dans quel pays se trouve le mont Everest ?",
            options: ["Inde", "Chine", "Népal", "Tibet"],
            correct: 2,
            explanation: "Le mont Everest se trouve à la frontière entre le Népal et le Tibet."
        }
    ],

    sport: [
        {
            question: "Combien de joueurs composent une équipe de football sur le terrain ?",
            options: ["10", "11", "12", "9"],
            correct: 1,
            explanation: "Une équipe de football compte 11 joueurs sur le terrain."
        },
        {
            question: "En quelle année ont eu lieu les premiers Jeux Olympiques modernes ?",
            options: ["1892", "1896", "1900", "1904"],
            correct: 1,
            explanation: "Les premiers Jeux Olympiques modernes ont eu lieu à Athènes en 1896."
        }
    ],

    cinéma: [
        {
            question: "Qui a réalisé le film 'Pulp Fiction' ?",
            options: ["Martin Scorsese", "Quentin Tarantino", "Steven Spielberg", "Christopher Nolan"],
            correct: 1,
            explanation: "Pulp Fiction a été réalisé par Quentin Tarantino en 1994."
        },
        {
            question: "Quel film a remporté l'Oscar du meilleur film en 2020 ?",
            options: ["Joker", "Parasite", "1917", "Once Upon a Time in Hollywood"],
            correct: 1,
            explanation: "Parasite de Bong Joon-ho a remporté l'Oscar du meilleur film en 2020."
        }
    ]
};

module.exports = {
    QUESTION_CATEGORIES,
    GAME_CONFIG,
    FALLBACK_QUESTIONS
};