const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let Player
let renderedSprites
let battleAnimationId
let queue


function initBattle() {
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attacksBox').replaceChildren();

  // Randomly select an enemy monster
  
  const enemyMonsterNames = Object.keys(monsters).filter(name => name !== 'Player'); // Exclude player's monster
  const randomEnemyName = enemyMonsterNames[Math.floor(Math.random() * enemyMonsterNames.length)];
  let currentEnemy = new Monster(monsters[randomEnemyName]); // Random enemy
  const enemyNameElement = document.querySelector('#enemyName');
  enemyNameElement.textContent = currentEnemy.name;
   // Assuming currentEnemy has a name property
  // Assuming 'Player' is always the player's monster for now
  Player = new Monster(monsters.Player); // Player's monster

  renderedSprites = [currentEnemy, Player];
  queue = [];

  Player.attacks.forEach((attack) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    document.querySelector('#attacksBox').append(button);
  });

  // our event listeners for our buttons (attack)
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      Player.attack({
        attack: selectedAttack,
        recipient: currentEnemy,
        renderedSprites
      });

      if (currentEnemy.health <= 0) {
        queue.push(() => {
          currentEnemy.faint();
        });
        queue.push(() => {
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0
              })

              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      }

    // Enemy's turn to attack
    const randomAttack = currentEnemy.attacks[Math.floor(Math.random() * currentEnemy.attacks.length)];
    console.log(`Queueing enemy attack: ${randomAttack.name}`);
    queue.push(() => {
      currentEnemy.attack({
        attack: randomAttack,
        recipient: Player,
        renderedSprites
      });

      // Check if the player's monster has fainted
      if (Player.health <= 0) {
        queue.push(() => {
          Player.faint();
        });

          queue.push(() => {
            // fade back to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'

                gsap.to('#overlappingDiv', {
                  opacity: 0
                })

                battle.initiated = false
                audio.Map.play()
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// initBattle()
// animateBattle()

function processQueue() {
  if (queue.length > 0) {
    queue[0](); // Execute the first function in the queue
    queue.shift(); // Remove the executed function from the queue
  }
}

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  processQueue();
  if (queue.length === 0) e.currentTarget.style.display = 'none';
});
