export const handleTouchStart = (
  event: React.TouchEvent<HTMLDivElement>,
  setStartY: React.Dispatch<React.SetStateAction<number>>,
) => {
  setStartY(event?.touches[0]?.clientY);
};

export const handleTouchEnd = (
  event: React.TouchEvent<HTMLDivElement>,
  startY: number,
  setStartY: React.Dispatch<React.SetStateAction<number>>,
  closeDrawer: () => void,
) => {
  const deltaY = event.changedTouches[0].clientY - startY;
  if (deltaY > 100) {
    closeDrawer();
  }
};
