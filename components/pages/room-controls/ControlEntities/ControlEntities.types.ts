import { ControlableEntities } from '../../../../types/room-controls.types';

export interface IControlEntitiesProps {
  setActiveControl: React.Dispatch<React.SetStateAction<ControlableEntities>>;
  activeControl: ControlableEntities;
}
