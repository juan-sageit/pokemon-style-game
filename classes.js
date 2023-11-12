function updateHealthBar(monsterName, newHealth) {
  let healthBarElement;
  if (monsterName === 'Player') {
      healthBarElement = document.getElementById('playerHealthBar');
  } else {
      healthBarElement = document.getElementById(`healthBar-${monsterName}`);
  }
  
  if (healthBarElement) {
      const healthPercentage = Math.max(0, Math.min(newHealth, 100)); // Clamps between 0 and 100
      healthBarElement.style.width = `${healthPercentage}%`;
      // ... other logic
  } else {
      console.warn(`Health bar element not found for ${monsterName}`);
  }
}

class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * (this.width / this.scale),
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.health = 100
    this.isEnemy = isEnemy
    this.name = name
    this.attacks = attacks
  }

  faint() {
    document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    audio.battle.stop()
    audio.victory.play()
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector('#dialogueBox').style.display = 'block'
    document.querySelector('#dialogueBox').innerHTML =
      this.name + ' used ' + attack.name

    let healthBar = '#enemyHealthBar'
    if (this.isEnemy) healthBar = '#playerHealthBar'

    let rotation = 1
    if (this.isEnemy) rotation = -2.2

    recipient.health -= attack.damage

    switch (attack.name) {
      case 'Fireball':
        audio.initFireball.play()
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })

        break
      case 'Tackle':
        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              audio.tackleHit.play()
              gsap.to(healthBar, {
                width: recipient.health + '%'
              })

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        break
        case 'Slash':
      audio.initSlash.play(); 
          const slashImage = new Image();
          slashImage.src = './img/slash.png';
          const slash = new Sprite({
            position: {
              x: this.position.x,
              y: this.position.y
            },
            image: slashImage,
            frames: { max: 5, hold: 5 },
            animate: true,
            rotation: this.isEnemy ? -0.5 : 0.5
          });
          renderedSprites.splice(1, 0, slash);
    
          gsap.to(slash.position, {
            x: recipient.position.x,
            y: recipient.position.y,
            onComplete: () => {
              audio.slashHit.play(); 
              recipient.health -= attack.damage; // Deduct health
              console.log(`Updating health bar for ${recipient.name} to ${recipient.health}`);
              updateHealthBar(recipient.name, recipient.health);
              renderedSprites.splice(renderedSprites.indexOf(slash), 1);
          }
          });
          break;
    
        case 'Crush':
          audio.initCrush.play();
          const crushImage = new Image();
          crushImage.src = './img/crush.png'; 
          const crush = new Sprite({
            position: {
              x: recipient.position.x,
              y: recipient.position.y - 100 
            },
            image: crushImage,
            frames: { max: 3, hold: 10 }, 
            animate: true
          });
          renderedSprites.splice(1, 0, crush);
    
          gsap.to(crush.position, {
            y: recipient.position.y,
            onComplete: () => {
              console.log(`Before attack, ${recipient.name}'s health: ${recipient.health}`);
              audio.crushHit.play();
              recipient.health -= attack.damage; // Deduct health
              console.log(`Updating health bar for ${recipient.name} to ${recipient.health}`);
              updateHealthBar(recipient.name, recipient.health);
              renderedSprites.splice(renderedSprites.indexOf(crush), 1);
            }
          });
          break;
          case 'Glare':

  audio.initGlare.play(); 

  const glareImage = new Image();
  glareImage.src = './img/glare.png'; 
  const glare = new Sprite({
    position: {
      x: this.position.x,
      y: this.position.y
    },
    image: glareImage,
    frames: {
      max: 4, 
      hold: 10
    },
    animate: true,
    rotation
  });

  renderedSprites.splice(1, 0, glare);

  gsap.to(glare.position, {
    x: recipient.position.x,
    y: recipient.position.y,
    onComplete: () => {
      console.log(`Before attack, ${recipient.name}'s health: ${recipient.health}`);
      audio.glareHit.play();
      recipient.health -= attack.damage; // Deduct health
      console.log(`Updating health bar for ${recipient.name} to ${recipient.health}`);
      updateHealthBar(recipient.name, recipient.health);
      renderedSprites.splice(renderedSprites.indexOf(glare), 1);
    }
  });
  break;
  case 'Earthquake':
  audio.initEarthquake.play();
  const earthquakeImage = new Image();
  earthquakeImage.src = './img/earthquake.png';
  const earthquake = new Sprite({
    position: {
      x: this.position.x,
      y: this.position.y
    },
    image: earthquakeImage,
    frames: {
      max: 4,
      hold: 10
    },
    animate: true,
    rotation
  });
  renderedSprites.splice(1, 0, earthquake);
  gsap.to(earthquake.position, {
    x: recipient.position.x,
    y: recipient.position.y,
    onComplete: () => {
      console.log(`Before attack, ${recipient.name}'s health: ${recipient.health}`);
      audio.earthquakeHit.play();
      recipient.health -= attack.damage; // Deduct health
      console.log(`Updating health bar for ${recipient.name} to ${recipient.health}`);
      updateHealthBar(recipient.name, recipient.health);
      renderedSprites.splice(renderedSprites.indexOf(earthquake), 1);
    }
  });
  break;
      default:
        break
    }
  }
}
class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Character extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = ['']
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale
    })

    this.dialogue = dialogue
    this.dialogueIndex = 0
  }
}
