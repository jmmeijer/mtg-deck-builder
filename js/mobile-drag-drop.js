const MOBILE_DRAG_THRESHOLD = 10;

let mobileDrag = null;
let suppressMobileClick = false;

function isMobilePointer(event) {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
}

function findMobileDragCard(target) {
  return target.closest?.('.card[data-id], .visual-stack-card[data-id]') || null;
}

function clearMobileDropState() {
  document.querySelectorAll('.col.over').forEach(column => column.classList.remove('over'));
  document.querySelectorAll('.drop-before, .drop-after').forEach(element => {
    element.classList.remove('drop-before', 'drop-after');
  });
}

function createMobileDragGhost(source) {
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true);
  ghost.classList.add('mobile-drag-ghost');
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  document.body.appendChild(ghost);

  return {
    ghost,
    offsetX: rect.width / 2,
    offsetY: Math.min(rect.height / 2, 90)
  };
}

function positionMobileDragGhost(ghost, x, y, offsetX = 0, offsetY = 0) {
  ghost.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0)`;
}

function getMobileDropTarget(x, y, draggedId) {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;

  const targetCard = findMobileDragCard(element);
  if (targetCard && targetCard.dataset.id !== draggedId) {
    const targetColumn = targetCard.closest('.col');
    if (!targetColumn?.dataset.sec) return null;

    return {
      column: targetColumn,
      card: targetCard,
      section: targetColumn.dataset.sec,
      targetId: targetCard.dataset.id,
      position: getCardDropPosition({ clientY: y }, targetCard)
    };
  }

  const targetColumn = element.closest?.('.col');
  if (targetColumn?.dataset.sec) {
    return {
      column: targetColumn,
      card: null,
      section: targetColumn.dataset.sec,
      targetId: null,
      position: 'end'
    };
  }

  return null;
}

function startMobileDrag(event, source) {
  mobileDrag.dragging = true;
  suppressMobileClick = true;
  dragged = mobileDrag.id;
  document.body.classList.add('mobile-dragging');
  source.classList.add('dragging');

  const { ghost, offsetX, offsetY } = createMobileDragGhost(source);
  mobileDrag.ghost = ghost;
  mobileDrag.offsetX = offsetX;
  mobileDrag.offsetY = offsetY;
  positionMobileDragGhost(mobileDrag.ghost, event.clientX, event.clientY, offsetX, offsetY);
}

function updateMobileDropTarget(event) {
  clearMobileDropState();
  const target = getMobileDropTarget(event.clientX, event.clientY, mobileDrag.id);
  mobileDrag.target = target;

  if (!target) return;

  if (target.card) {
    showCardDropIndicator(target.card, target.position);
  } else {
    target.column.classList.add('over');
  }
}

function finishMobileDrag(event) {
  const drag = mobileDrag;
  mobileDrag = null;
  dragged = null;

  if (drag?.ghost) drag.ghost.remove();
  drag?.source?.classList.remove('dragging');
  document.body.classList.remove('mobile-dragging');
  clearMobileDropState();

  if (!drag?.dragging) return;

  event.preventDefault();
  event.stopPropagation();

  if (drag.target?.section) {
    const moved = moveCard(drag.id, drag.target.section, drag.target.targetId, drag.target.position);
    if (moved) {
      const targetName = drag.target.targetId ? state.cards.find(card => card.id === drag.target.targetId)?.name : null;
      msg(targetName ? `${moved.name} moved ${drag.target.position} ${targetName}.` : `${moved.name} moved to the end of ${sectionTitle(drag.target.section)}.`);
    }
  }

  setTimeout(() => {
    suppressMobileClick = false;
  }, 150);
}

function cancelMobileDrag() {
  if (!mobileDrag) return;
  mobileDrag.ghost?.remove();
  mobileDrag.source?.classList.remove('dragging');
  mobileDrag = null;
  dragged = null;
  document.body.classList.remove('mobile-dragging');
  clearMobileDropState();
  setTimeout(() => {
    suppressMobileClick = false;
  }, 150);
}

function bindMobileDragDrop() {
  board.addEventListener('click', event => {
    if (!suppressMobileClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressMobileClick = false;
  }, true);

  board.addEventListener('pointerdown', event => {
    if (!isMobilePointer(event) || event.button !== 0) return;
    if (event.target.closest('.quick, button, input, select, a')) return;

    const source = findMobileDragCard(event.target);
    if (!source) return;

    mobileDrag = {
      id: source.dataset.id,
      source,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      ghost: null,
      offsetX: 0,
      offsetY: 0,
      target: null
    };

    source.setPointerCapture?.(event.pointerId);
  });

  board.addEventListener('pointermove', event => {
    if (!mobileDrag || event.pointerId !== mobileDrag.pointerId) return;

    const dx = event.clientX - mobileDrag.startX;
    const dy = event.clientY - mobileDrag.startY;
    const distance = Math.hypot(dx, dy);

    if (!mobileDrag.dragging && distance < MOBILE_DRAG_THRESHOLD) return;
    if (!mobileDrag.dragging) startMobileDrag(event, mobileDrag.source);

    event.preventDefault();
    positionMobileDragGhost(mobileDrag.ghost, event.clientX, event.clientY, mobileDrag.offsetX, mobileDrag.offsetY);
    updateMobileDropTarget(event);
  });

  board.addEventListener('pointerup', event => {
    if (!mobileDrag || event.pointerId !== mobileDrag.pointerId) return;
    finishMobileDrag(event);
  });

  board.addEventListener('pointercancel', event => {
    if (!mobileDrag || event.pointerId !== mobileDrag.pointerId) return;
    cancelMobileDrag();
  });
}

document.addEventListener('DOMContentLoaded', bindMobileDragDrop);
