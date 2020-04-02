import React from 'react';
import { Link } from 'react-router-dom';

import { getRubricUrl } from '../../../../lib/url-builder';
import { RecommendedEvents } from '../../../../redux/slices/recommended-events';

import EventsSlider from '../../../../components/EventsSlider';
import EventCardVertical from '../../../../components/EventCardVertical';

import ContentBlock from '../ContentBlock';
import Title from '../Title';

import styles from './styles.module.css';

type Props = {
    title: string;
    events: RecommendedEvents['concert'];
    tagCode?: string;
};

const EventsFeed: React.FC<Props> = ({ title, events, tagCode }) => {
    if (!events) {
        return null;
    }

    if (events.items.length === 0) {
        return null;
    }

    return (
        <ContentBlock className={styles.container}>
            <Title>{title}</Title>
            {tagCode && events.paging.total > 5 ? <MoreButton tagCode={tagCode} /> : null}
            <EventsSlider items={events.items} component={EventCardVertical} />
        </ContentBlock>
    );
};

const MoreButton: React.FC<{ tagCode: string }> = props => {
    return (
        <Link className={styles.button} to={getRubricUrl(props.tagCode)}>
            Все
        </Link>
    );
};

export default EventsFeed;
