import { IGetActivitiesApiResponse } from 'core/graphql/queries/GET_ACTIVITY';

export interface IActivityCarouselProps {
  data: IGetActivitiesApiResponse['getActivitiesV2']['activities'];
}
