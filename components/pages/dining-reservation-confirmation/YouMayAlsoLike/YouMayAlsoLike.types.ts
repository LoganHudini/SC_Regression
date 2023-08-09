import { IRDDetailsApiResponse } from 'core/graphql/queries/IRD_DETAILS';

export interface IYouMayAlsoLikeProps {
  items: IRDDetailsApiResponse['getIRDDetails']['items'];
}
