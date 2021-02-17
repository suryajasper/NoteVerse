function createRipple(event, styles, color) {
  const button = event.currentTarget;
  const bounds = button.getBoundingClientRect();

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - bounds.left - radius}px`;
  circle.style.top = `${event.clientY - bounds.top - radius}px`;
  circle.classList.add(styles.ripple);
  if (color)
    circle.style.backgroundColor = color;

  const ripple = button.getElementsByClassName(styles.ripple)[0];

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

export {createRipple};