import React, { ReactElement, useRef } from 'react';
import { useSelector } from 'react-redux';

import { RootReducer } from '../../redux';
import { Event, EventPage, ScheduleInfo } from '../../redux/slices/event';

import PageHeader from '../../components/PageHeader';
import Gallery from '../../components/Gallery';
import CollapsedText from '../../components/CollapsedText';

import { useVisible } from '../../hooks/useVisible';

import Title from './components/Title';
import ContentBlock from './components/ContentBlock';
import Cover from './components/Cover';
import TicketButton from './components/TicketButton';
import VenueInfo from './components/VenueInfo';
import RecommendedEventsLazyBlock from './components/RecommendedEvents';

import styles from './styles.module.css';

type Props = {
    id: string;
    skeleton: ReactElement;
};

const IMAGE_INTERSECTION_OBSERVER_OPTIONS = { threshold: [1] };

const Component: React.FC<Props> = ({ id, skeleton }) => {
    const mainImageRef = useRef<HTMLDivElement | null>(null);

    const eventPage: Partial<EventPage> = useSelector((state: RootReducer) => state.event.data[id]) || {};
    const event = (eventPage.event || {}) as Event;
    const schedule = (eventPage.schedule || {}) as ScheduleInfo;
    const isLoading = !event.id;

    const { images, description, type, tickets } = event;
    const { preview } = schedule;
    const ticket = tickets && tickets[0];

    const isImageVisible = useVisible(mainImageRef, IMAGE_INTERSECTION_OBSERVER_OPTIONS);
    const isPageHeaderClear = isImageVisible || isImageVisible === undefined;

    if (isLoading) {
        return skeleton;
    }

    return (
        <>
            <PageHeader
                mods={isPageHeaderClear ? 'clear' : ''}
                backward={isPageHeaderClear ? 'white' : 'black'}
                hasLogo={false}
                hasMenu={false}
            />

            <Cover event={event} imageRef={mainImageRef} />

            <div className={styles.wrapper}>
                <TicketButton event={event} />

                {type && <div className={styles.city}>{type.name} в Москве</div>}
                {preview && <div className={styles.schedule}>{preview.text}</div>}

                <ContentBlock>
                    <VenueInfo schedule={schedule} />
                </ContentBlock>

                {images && images.length > 0 && (
                    <ContentBlock>
                        <Title>Фотогалерея</Title>
                        <Gallery items={images} />
                    </ContentBlock>
                )}

                {description && (
                    <ContentBlock>
                        <Title>Описание</Title>
                        <CollapsedText lines={5} className={styles.description} fullTextLabel={'Полное описание'}>
                            {description}
                        </CollapsedText>
                    </ContentBlock>
                )}

                <RecommendedEventsLazyBlock />

                {ticket && <div className={styles.placeholder} />}
            </div>
        </>
    );
};

export default Component;
