const monsters = {
  Emby: {
    position: {
      x: 200,
      y: 88
    },
    image: {
      src: './img/embySprite.png'
    },
    frames: {
      max: 1,
      hold: 30
    },
    animate: true,
    name: 'Dovakhiin',
    attacks: [attacks.Tackle, attacks.Fireball]
  },
  Draggle: {
    position: {
      x: 600,
      y: 0
    },
    image: {
      src: './img/draggleSprite.png'
    },
    frames: {
      max: 1,
      hold: 30
    },
    animate: true,
    isEnemy: true,
    name: 'Witch',
    attacks: [attacks.Tackle, attacks.Fireball]
  },
  Glimmer: {
    position: {
      x: 600,
      y: -500
    },
    image: {
      src: './img/glimmerSprite.png' // Assuming you have a separate sprite for Glimmer
    },
    frames: {
      max: 1,
      hold: 25
    },
    animate: true,
    name: 'Gloria',
    attacks: [attacks.Slash, attacks.Glare]
  },
  // ... Repeat the same structure for other monsters ...
  // Example for Boulder:
  Boulder: {
    position: {
      x: 600,
      y: 0
    },
    image: {
      src: './img/boulderSprite.png' // Assuming you have a separate sprite for Boulder
    },
    frames: {
      max: 1,
      hold: 35
    },
    animate: true,
    isEnemy: true,
    name: 'Meatball',
    attacks: [attacks.Crush, attacks.Earthquake]
  },
}