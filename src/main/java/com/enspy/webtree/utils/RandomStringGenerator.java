package com.enspy.webtree.utils;

import java.util.Random;

public class RandomStringGenerator {

    // Méthode pour générer une chaîne aléatoire
    public static String generateRandomString(int length) {
        // Ensemble de caractères possibles (lettres majuscules, lettres minuscules,
        // chiffres)
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        // Créer un objet Random pour générer des nombres aléatoires
        Random random = new Random();

        // StringBuilder pour construire la chaîne finale
        StringBuilder result = new StringBuilder();

        // Remplir la chaîne avec des caractères choisis aléatoirement
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length()); // Sélectionner un indice aléatoire
            result.append(characters.charAt(index)); // Ajouter le caractère correspondant à cet indice
        }

        return result.toString(); // Retourner la chaîne générée
    }
}
