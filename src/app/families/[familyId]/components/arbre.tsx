import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Person, Relationship, FamilyTreeData, Path } from '../lib/types';
import { organizeByGeneration } from './relations';

interface FamilyTreeProps {
  familyData: FamilyTreeData;
  rootPerson: Person | null;
  relationshipPath?: Relationship[];
  onNodeClick?: (person: Person) => void;
  orientation?: 'vertical' | 'horizontal';
}

const FamilyTreeComponent: React.FC<FamilyTreeProps> = ({
  familyData,
  rootPerson,
  relationshipPath = [],
  onNodeClick,
  orientation = 'vertical'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isHorizontalLayout = orientation === 'horizontal';

  // Fonction de gestion du clic sur un nœud
  const handleNodeClick = (person: Person) => {
    if (onNodeClick) {
      onNodeClick(person);
    }
  };

// Dessiner l'arbre avec D3
useEffect(() => {
    if (!svgRef.current || !rootPerson || !familyData.persons.length) return;

    // Nettoyer le SVG existant
    d3.select(svgRef.current).selectAll("*").remove();

    // Utiliser la fonction organizeByGeneration importée de relationUtils
    const generationsMap = organizeByGeneration(familyData, rootPerson?.id || '');
    
    // Trouver les générations min et max pour dimensionner l'arbre
    const generations = Array.from(generationsMap.keys()).sort((a, b) => a - b);
    const minGeneration = Math.min(...generations);
    const maxGeneration = Math.max(...generations);
    
    // Dimensions et marges augmentées pour plus d'espace
    const margin = { top: 150, right: 180, bottom: 150, left: 180 };
    const width = 1800 - margin.left - margin.right;
    const height = 1200 - margin.top - margin.bottom;
    
    // Ajuster SVG à la taille nécessaire
    d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
    // Définir les gradients et filtres
    const defs = svg.append("defs");
    
    // Gradient pour les hommes avec couleurs plus prononcées
    defs.append("linearGradient")
      .attr("id", "male-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#d9e8ff"},
        {offset: "100%", color: "#a0c8ff"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
      
    // Gradient pour les femmes avec couleurs plus prononcées
    defs.append("linearGradient")
      .attr("id", "female-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#ffe0eb"},
        {offset: "100%", color: "#ffb0c6"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
      
    // Gradient neutre
    defs.append("linearGradient")
      .attr("id", "neutral-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#f5f5f5"},
        {offset: "100%", color: "#e0e0e0"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
    
    // Gradient doré pour les relations d'époux plus visible
    defs.append("linearGradient")
      .attr("id", "spouse-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#ffd700"},
        {offset: "50%", color: "#ffcc33"},
        {offset: "100%", color: "#cc9900"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // Gradient pour le chemin mis en évidence plus visible
    defs.append("linearGradient")
      .attr("id", "path-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#ff3a45"},
        {offset: "50%", color: "#ff5e62"},
        {offset: "100%", color: "#ff9966"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
      
    // Filtre pour l'effet d'ombre amélioré
    defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%")
      .append("feDropShadow")
      .attr("dx", 1)
      .attr("dy", 3)
      .attr("stdDeviation", 4)
      .attr("flood-color", "rgba(0, 0, 0, 0.4)")
      .attr("flood-opacity", 0.6);
      
    // Symbole d'anneau pour les mariages plus visible
    defs.append("symbol")
      .attr("id", "wedding-ring")
      .attr("viewBox", "0 0 40 40")
      .append("circle")
      .attr("cx", 20)
      .attr("cy", 20)
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", "#ffd700")
      .attr("stroke-width", 4);

    // Échelles pour positionner les générations avec espacement régulier et amélioré
    const generationScale = isHorizontalLayout
      ? d3.scaleLinear()
          .domain([minGeneration, maxGeneration])
          .range([0, height])
      : d3.scaleLinear()
          .domain([minGeneration, maxGeneration])
          .range([0, width]);
          
    // ----- PLACEMENT DES NŒUDS AVEC ESPACEMENT RÉGULIER -----
          
    // Calculer l'espacement optimal entre les nœuds en garantissant régularité
    const getOptimalSpacing = (generation, personCount) => {
      const baseSpace = isHorizontalLayout ? width : height;
      // Espacement minimum entre les nœuds augmenté
      const minSpacing = 220; 
      
      // Garantir un espacement suffisant et régulier
      const spacing = Math.max(minSpacing, baseSpace / (personCount + 1));
      return spacing;
    };
    
    // Positionnement des nœuds avec espacement régulier amélioré
    const nodes: {person: Person, x: number, y: number}[] = [];
    const nodeById = new Map<string, {person: Person, x: number, y: number}>();
    
    // Distribution véritablement équidistante des nœuds sur chaque génération
    for (const [generation, persons] of generationsMap.entries()) {
      const genPosition = generationScale(generation);
      
      if (isHorizontalLayout) {
        // Calcul de l'espacement optimal pour cette génération
        const spacing = getOptimalSpacing(generation, persons.length);
        
        // Répartir uniformément sur la largeur disponible
        persons.forEach((person, idx) => {
          // Position équidistante avec marge supplémentaire
          const xPos = spacing * (idx + 1);
          const node = {
            person,
            x: xPos,
            y: genPosition
          };
          nodes.push(node);
          nodeById.set(person.id, node);
        });
      } else {
        // Calcul de l'espacement optimal pour cette génération
        const spacing = getOptimalSpacing(generation, persons.length);
        
        // Répartir uniformément sur la hauteur disponible
        persons.forEach((person, idx) => {
          // Position équidistante avec marge supplémentaire
          const yPos = spacing * (idx + 1);
          const node = {
            person,
            x: genPosition,
            y: yPos
          };
          nodes.push(node);
          nodeById.set(person.id, node);
        });
      }
    }
    
    // Optimiser les positions des conjoints pour qu'ils soient côte à côte tout en respectant l'alignement
    const nodeSize = 90; // Taille des nœuds augmentée
    const spouseOffset = nodeSize * 1.8; // Distance entre conjoints augmentée
    
    for (const rel of familyData.relationships) {
      if (rel.type === 'spouse') {
        const node1 = nodeById.get(rel.from);
        const node2 = nodeById.get(rel.to);
        
        if (node1 && node2) {
          // Ajuster la position pour garder les conjoints côte à côte
          if (isHorizontalLayout) {
            // Centrer les conjoints sur leur position moyenne
            const avgX = (node1.x + node2.x) / 2;
            node1.x = avgX - spouseOffset / 2;
            node2.x = avgX + spouseOffset / 2;
          } else {
            // Centrer les conjoints sur leur position moyenne
            const avgY = (node1.y + node2.y) / 2;
            node1.y = avgY - spouseOffset / 2;
            node2.y = avgY + spouseOffset / 2;
          }
        }
      }
    }
    
    // ----- CRÉATION DES POINTS DE JONCTION POUR LES LIGNES ORTHOGONALES -----
    
    // Créer les points d'union pour les parents-enfants avec des lignes orthogonales
    const junctionPoints: {x: number, y: number, parents: string[], children: string[]}[] = [];

    // Grouper les enfants par couple de parents
    const childrenByParents = new Map<string, string[]>();
    
    for (const rel of familyData.relationships) {
      if (rel.type === 'parent-child') {
        const parentId = rel.from;
        const childId = rel.to;
        
        // Trouver l'autre parent s'il existe
        const otherParents = familyData.relationships.filter(r => 
          r.type === 'parent-child' && r.to === childId && r.from !== parentId
        ).map(r => r.from);
        
        for (const otherParentId of otherParents) {
          // Créer une clé unique pour le couple de parents (triée pour être cohérente)
          const parentsKey = [parentId, otherParentId].sort().join('|');
          
          if (!childrenByParents.has(parentsKey)) {
            childrenByParents.set(parentsKey, []);
          }
          
          if (!childrenByParents.get(parentsKey)?.includes(childId)) {
            childrenByParents.get(parentsKey)?.push(childId);
          }
        }
        
        // Si pas d'autre parent, utiliser un parent unique
        if (otherParents.length === 0) {
          const singleParentKey = `single|${parentId}`;
          
          if (!childrenByParents.has(singleParentKey)) {
            childrenByParents.set(singleParentKey, []);
          }
          
          if (!childrenByParents.get(singleParentKey)?.includes(childId)) {
            childrenByParents.get(singleParentKey)?.push(childId);
          }
        }
      }
    }
    
    // Créer les points de jonction avec des segments orthogonaux améliorés
    for (const [parentsKey, childrenIds] of childrenByParents.entries()) {
      const parentIds = parentsKey.startsWith('single|') 
        ? [parentsKey.split('|')[1]] 
        : parentsKey.split('|');
      
      const parentNodes = parentIds
        .map(id => nodeById.get(id))
        .filter(node => node !== undefined) as {person: Person, x: number, y: number}[];
      
      const childNodes = childrenIds
        .map(id => nodeById.get(id))
        .filter(node => node !== undefined) as {person: Person, x: number, y: number}[];
      
      if (parentNodes.length > 0 && childNodes.length > 0) {
        // Calculer le point de jonction pour lignes orthogonales
        let parentJunctionX, parentJunctionY, childJunctionX, childJunctionY;
        
        // Point entre les parents (ou directement sous le parent unique)
        if (parentNodes.length === 2) {
          // Point entre les deux parents
          parentJunctionX = (parentNodes[0].x + parentNodes[1].x) / 2;
          parentJunctionY = (parentNodes[0].y + parentNodes[1].y) / 2;
        } else {
          // Point au même niveau que le parent unique
          parentJunctionX = parentNodes[0].x;
          parentJunctionY = parentNodes[0].y;
        }
        
        // Calculer le point central des enfants
        const childrenCenterX = d3.mean(childNodes, d => d.x) || 0;
        const childrenCenterY = d3.mean(childNodes, d => d.y) || 0;
        
        // Pour un layout horizontal, les enfants sont une génération en dessous
        if (isHorizontalLayout) {
          // Un point de jonction vertical sous les parents
          childJunctionX = childrenCenterX;
          childJunctionY = parentJunctionY + (childrenCenterY - parentJunctionY) / 2;
          
          junctionPoints.push({
            x: parentJunctionX,
            y: parentJunctionY + nodeSize/2, // Ajustement pour partir du bas du nœud
            parents: parentIds,
            children: []
          });
          
          junctionPoints.push({
            x: childJunctionX,
            y: childJunctionY,
            parents: [],
            children: childrenIds
          });
        } else {
          // Un point de jonction horizontal à côté des parents
          childJunctionX = parentJunctionX + (childrenCenterX - parentJunctionX) / 2;
          childJunctionY = childrenCenterY;
          
          junctionPoints.push({
            x: parentJunctionX + nodeSize/2, // Ajustement pour partir du côté du nœud
            y: parentJunctionY,
            parents: parentIds,
            children: []
          });
          
          junctionPoints.push({
            x: childJunctionX,
            y: childJunctionY,
            parents: [],
            children: childrenIds
          });
        }
        
        // Ajouter le lien central entre les deux points de jonction avec style amélioré
        svg.append("path")
          .attr("class", "link junction-junction")
          .attr("d", () => {
            if (isHorizontalLayout) {
              // Ligne verticale entre les deux jonctions
              return `M${parentJunctionX},${parentJunctionY + nodeSize/2} L${parentJunctionX},${childJunctionY} L${childJunctionX},${childJunctionY}`;
            } else {
              // Ligne horizontale entre les deux jonctions
              return `M${parentJunctionX + nodeSize/2},${parentJunctionY} L${childJunctionX},${parentJunctionY} L${childJunctionX},${childJunctionY}`;
            }
          })
          .attr("fill", "none")
          .attr("stroke", "#2c2c2c")
          .attr("stroke-width", 3) // Lignes plus épaisses
          .attr("stroke-linecap", "round") // Extrémités arrondies
          .attr("stroke-linejoin", "round"); // Jonctions arrondies
          
        // Ajouter un anneau de mariage si deux parents
        if (parentIds.length === 2) {
          svg.append("use")
            .attr("href", "#wedding-ring")
            .attr("x", parentJunctionX - 15)
            .attr("y", parentJunctionY - 15)
            .attr("width", 30)
            .attr("height", 30);
        }
      }
    }
    
    // Dessiner les lignes de génération (grille de référence)
    for (const generation of generations) {
      if (isHorizontalLayout) {
        const lineY = generationScale(generation);
        
        svg.append("line")
          .attr("x1", 0)
          .attr("y1", lineY)
          .attr("x2", width)
          .attr("y2", lineY)
          .attr("stroke", "#e5e5e5")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", 10)
          .attr("y", lineY - 15)
          .attr("fill", "#666")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(`Génération ${generation === 0 ? "0 (référence)" : generation}`);
      } else {
        const lineX = generationScale(generation);
        
        svg.append("line")
          .attr("x1", lineX)
          .attr("y1", 0)
          .attr("x2", lineX)
          .attr("y2", height)
          .attr("stroke", "#e5e5e5")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", lineX + 8)
          .attr("y", 20)
          .attr("fill", "#666")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(`Génération ${generation === 0 ? "0 (référence)" : generation}`);
      }
    }

    // ----- DESSINER LES LIENS ORTHOGONAUX AMÉLIORÉS -----
    
    // Dessiner les liens entre parents et points de jonction
    for (const junction of junctionPoints) {
      for (const parentId of junction.parents) {
        const parentNode = nodeById.get(parentId);
        if (parentNode) {
          svg.append("path")
            .attr("class", "link parent-junction")
            .attr("d", `M${parentNode.x},${parentNode.y} L${junction.x},${junction.y}`)
            .attr("fill", "none")
            .attr("stroke", "#2c2c2c")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
            .attr("id", `link-parent-${parentId}-junction`);
        }
      }
      
      // Dessiner les liens entre le point de jonction et les enfants (lignes orthogonales)
      for (const childId of junction.children) {
        const childNode = nodeById.get(childId);
        if (childNode) {
          svg.append("path")
            .attr("class", "link junction-child")
            .attr("d", () => {
              if (isHorizontalLayout) {
                // Créer un chemin en ligne brisée orthogonale avec départ plus précis
                return `M${junction.x},${junction.y} L${childNode.x},${junction.y} L${childNode.x},${childNode.y - nodeSize/2}`; // Arriver au haut du nœud enfant
              } else {
                // Créer un chemin en ligne brisée orthogonale avec départ plus précis
                return `M${junction.x},${junction.y} L${junction.x},${childNode.y} L${childNode.x - nodeSize/2},${childNode.y}`; // Arriver au côté gauche du nœud enfant
              }
            })
            .attr("fill", "none")
            .attr("stroke", "#2c2c2c")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("id", `link-junction-child-${childId}`);
        }
      }
    }
    
    // Dessiner les liens maritaux (lignes droites) améliorés
    for (const rel of familyData.relationships) {
      if (rel.type === 'spouse') {
        const node1 = nodeById.get(rel.from);
        const node2 = nodeById.get(rel.to);
        
        if (node1 && node2) {
          // Calculer le point central entre les conjoints
          const midX = (node1.x + node2.x) / 2;
          const midY = (node1.y + node2.y) / 2;
          
          svg.append("path")
            .attr("class", "link spouse")
            .attr("d", `M${node1.x},${node1.y}L${node2.x},${node2.y}`)
            .attr("fill", "none")
            .attr("stroke", "url(#spouse-gradient)")
            .attr("stroke-width", 3.5) // Plus épais
            .attr("stroke-dasharray", "8,4") // Tirets plus visibles
            .attr("stroke-linecap", "round")
            .attr("id", `link-${rel.from}-${rel.to}`);
            
          // Ajouter un anneau plus visible au milieu de la relation conjugale
          svg.append("use")
            .attr("href", "#wedding-ring")
            .attr("x", midX - 15)
            .attr("y", midY - 15)
            .attr("width", 30)
            .attr("height", 30);
        }
      }
    }

    // Dessiner les nœuds avec photos visibles pour tous les genres
    const nodeGroups = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        handleNodeClick(d.person);
      });

    // Nœuds avec formes différentes selon le genre et photos visibles
    nodeGroups.each(function(d) {
      const node = d3.select(this);
      const person = d.person;
      const isRoot = person.id === rootPerson.id;
      
      // Forme différente selon le genre
      if (person.gender === 'female') {
        // Cercle pour les femmes avec bordure plus visible
        node.append("circle")
          .attr("r", nodeSize / 2)
          .attr("fill", "url(#female-gradient)")
          .attr("stroke", isRoot ? "#ff8c00" : "#d8a0b4")
          .attr("stroke-width", isRoot ? 4 : 3)
          .attr("filter", "url(#drop-shadow)")
          .on("mouseover", function() {
            d3.select(this).attr("opacity", 0.8).attr("stroke-width", isRoot ? 5 : 4);
          })
          .on("mouseout", function() {
            d3.select(this).attr("opacity", 1).attr("stroke-width", isRoot ? 4 : 3);
          });
      } else {
        // Carré pour les hommes avec bordure plus visible
        node.append("rect")
          .attr("width", nodeSize)
          .attr("height", nodeSize)
          .attr("x", -nodeSize / 2)
          .attr("y", -nodeSize / 2)
          .attr("rx", 12) // Coins plus arrondis
          .attr("ry", 12) // Coins plus arrondis
          .attr("fill", person.gender === 'male' ? "url(#male-gradient)" : "url(#neutral-gradient)")
          .attr("stroke", isRoot ? "#ff8c00" : (person.gender === 'male' ? "#8bbdbd" : "#aaaaaa"))
          .attr("stroke-width", isRoot ? 4 : 3)
          .attr("filter", "url(#drop-shadow)")
          .on("mouseover", function() {
            d3.select(this).attr("opacity", 0.8).attr("stroke-width", isRoot ? 5 : 4);
          })
          .on("mouseout", function() {
            d3.select(this).attr("opacity", 1).attr("stroke-width", isRoot ? 4 : 3);
          });
      }
      
// Ajouter photo avec clipPath amélioré pour tous les genres
const clipPathId = `clip-${person.id}`;

// Créer un clipPath pour l'image adapté à la forme
node.append("defs")
  .append("clipPath")
  .attr("id", clipPathId)
  .append(person.gender === 'female' ? "circle" : "rect")
  .attr(person.gender === 'female' ? "r" : "width", person.gender === 'female' ? (nodeSize / 2 - 5) : (nodeSize - 10))
  .attr(person.gender === 'female' ? "cx" : "x", person.gender === 'female' ? 0 : (-nodeSize / 2 + 5))
  .attr(person.gender === 'female' ? "cy" : "y", person.gender === 'female' ? 0 : (-nodeSize / 2 + 5))
  .attr("rx", person.gender === 'female' ? undefined : 10) // Coins arrondis pour les rectangles
  .attr("ry", person.gender === 'female' ? undefined : 10); // Coins arrondis pour les rectangles
      
      // Ajouter l'image pour tous les genres si disponible
      if (person.imageUrl) {
        node.append("image")
          .attr("xlink:href", person.imageUrl)
          .attr("width", nodeSize - 10)
          .attr("height", nodeSize - 10)
          .attr("x", -nodeSize / 2 + 5)
          .attr("y", -nodeSize / 2 + 5)
          .attr("clip-path", `url(#${clipPathId})`)
          .attr("preserveAspectRatio", "xMidYMid slice");
      } else {
        // Icône par défaut améliorée si pas d'image
        const iconColor = person.gender === 'male' ? "#4682B4" : "#D8779B";
        if (person.gender === 'male') {
          // Icône masculine plus visible
          node.append("path")
            .attr("d", "M-8,-20 L8,-20 L8,0 L15,0 L0,20 L-15,0 L-8,0 Z") // Icône masculine agrandie
            .attr("fill", iconColor)
            .attr("stroke", "#333")
            .attr("stroke-width", 1);
        } else {
          // Icône féminine plus visible
          node.append("circle")
            .attr("r", 13)
            .attr("cy", -8)
            .attr("fill", iconColor)
            .attr("stroke", "#333")
            .attr("stroke-width", 1);
          node.append("path")
            .attr("d", "M0,5 L0,20 M-8,13 L8,13") // Croix en dessous agrandie
            .attr("stroke", iconColor)
            .attr("stroke-width", 3);
        }
      }
      
      // Fond blanc pour le texte pour améliorer la lisibilité
      node.append("rect")
        .attr("x", -nodeSize / 2 - 5)
        .attr("y", nodeSize / 2 + 5)
        .attr("width", nodeSize + 10)
        .attr("height", 45)
        .attr("fill", "rgba(255, 255, 255, 0.85)")
        .attr("rx", 5)
        .attr("ry", 5);
      
      // Nom avec meilleure lisibilité
      node.append("text")
        .attr("x", 0)
        .attr("y", nodeSize / 2 + 20)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
        .attr("font-weight", "600")
        .attr("font-size", "14px") // Taille augmentée
        .attr("fill", "#1a1a1a") // Couleur plus foncée pour contraste
        .text(() => {
          // Couper le nom s'il est trop long
          return person.name.length > 15 ? person.name.substring(0, 13) + '...' : person.name;
        });

      // Dates avec style amélioré
      node.append("text")
        .attr("x", 0)
        .attr("y", nodeSize / 2 + 40)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
        .attr("font-size", "12px") // Taille augmentée
        .attr("fill", "#333") // Couleur plus foncée pour contraste
        .text(() => {
          if (person.birthYear) {
            return person.deathYear 
              ? `${person.birthYear} - ${person.deathYear}`
              : `${person.birthYear} - présent`;
          }
          return "";
        });
        
      // Indicateur spécial pour la personne racine
      if (isRoot) {
        // Badge "Référence" plus visible
        node.append("path")
          .attr("d", `M-35,-${nodeSize / 2 - 5} h70 v-25 h-60 z`)
          .attr("fill", "#ff8c00")
          .attr("rx", 5)
          .attr("ry", 5);
          
        node.append("text")
          .attr("x", 0)
          .attr("y", -nodeSize / 2 - 15)
          .attr("text-anchor", "middle")
          .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", "white")
          .text("Référence");
      }
    });

    // Mettre en évidence le chemin de relation si fourni
    if (relationshipPath.length > 0) {
      highlightPath(relationshipPath);
    }

  }, [rootPerson, familyData, relationshipPath, isHorizontalLayout]);

  // Fonction pour mettre en évidence un chemin de relations
const highlightPath = (
    svgRef: React.RefObject<SVGSVGElement>,
    path: Relationship[]
  ): void => {
    if (!svgRef.current || !path.length) return;
    
    // Réinitialiser tous les liens à leur apparence par défaut
    d3.select(svgRef.current)
      .selectAll(".link")
      .attr("stroke", function() {
        // Conserver les couleurs d'origine en fonction du type de lien
        const className = d3.select(this).attr("class");
        if (className.includes("spouse")) return "url(#spouse-gradient)";
        return "#3f373c";
      })
      .attr("stroke-width", function() {
        const className = d3.select(this).attr("class");
        if (className.includes("spouse")) return 2.5;
        return 2;
      })
      .attr("stroke-dasharray", function() {
        const className = d3.select(this).attr("class");
        if (className.includes("spouse")) return "6,3";
        return "none";
      })
      .attr("opacity", 1);
    
    // Mettre en évidence le chemin avec un dégradé animé
    for (const rel of path) {
      // Sélectionner les liens dans les deux directions
      d3.select(svgRef.current)
        .selectAll([
          `#link-${rel.from}-${rel.to}`,
          `#link-${rel.to}-${rel.from}`,
          `#link-parent-${rel.from}-junction`,
          `#link-parent-${rel.to}-junction`,
          `#link-junction-child-${rel.from}`,
          `#link-junction-child-${rel.to}`
        ].join(', '))
        .attr("stroke", "url(#path-gradient)")
        .attr("stroke-width", 3.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", "6,3")
        .attr("opacity", 0.9);
    }
  };
  
  // Fonction utilitaire pour définir le gradient dans le SVG
const setupPathGradient = (
    svgRef: React.RefObject<SVGSVGElement>,
    colors: string[] = ["#4f6df5", "#c95bf5"]
  ): void => {
    if (!svgRef.current) return;
    
    // Créer le gradient linéaire pour le chemin de relation
    const defs = d3.select(svgRef.current).select("defs");
    
    // Supprimer l'ancien gradient s'il existe
    defs.select("#path-gradient").remove();
    
    // Créer le nouveau gradient
    const gradient = defs.append("linearGradient")
      .attr("id", "path-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    // Ajouter les stops de couleur
    colors.forEach((color, index) => {
      gradient.append("stop")
        .attr("offset", `${index * 100 / (colors.length - 1)}%`)
        .attr("stop-color", color);
    });
    
    // Ajouter une animation au gradient
    const animate = defs.append("animate")
      .attr("xlink:href", "#path-gradient")
      .attr("attributeName", "x1")
      .attr("values", "-100%;100%")
      .attr("dur", "3s")
      .attr("repeatCount", "indefinite");
  };

  return (
    <div className="family-tree-container">
      <svg ref={svgRef} className="family-tree-svg"></svg>
    </div>
  );
};

export default FamilyTreeComponent;