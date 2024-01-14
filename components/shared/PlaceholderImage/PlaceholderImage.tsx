import PlaceholderIcon from '@icons/imagePlaceholder.svg';
import styles from './PageHolderImage.module.scss';
import cx from 'classnames';

export const PlaceholderImage = () => {
  return (
    <div className={cx(styles.image, styles.imagePlaceholder)}>
      <PlaceholderIcon viewBox='0 0 85.272 62.533' />
    </div>
  );
};
