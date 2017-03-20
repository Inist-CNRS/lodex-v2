import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { Link } from 'react-router';

import Loading from '../../lib/Loading';
import { ResourceComponent } from './Resource';
import Detail from './Detail';
import RemovedDetail from './RemovedDetail';

describe('<Resource />', () => {
    it('should display Loading if loading prop is true', () => {
        const props = {
            loading: true,
            p: { t: () => {} },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        expect(wrapper.find(Loading).length).toEqual(1);
    });

    it('should display not found message if no resource', () => {
        const props = {
            loading: false,
            p: { t: () => {} },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        expect(wrapper.find(Loading).length).toEqual(0);
        expect(wrapper.find('.not-found').length).toEqual(1);
    });

    it('should display Detail if resource', () => {
        const props = {
            loading: false,
            resource: 'resource',
            p: { t: () => {} },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        expect(wrapper.find(Loading).length).toEqual(0);
        expect(wrapper.find('.not-found').length).toEqual(0);
        expect(wrapper.find(Detail).length).toEqual(1);
    });

    it('should display RemovedDetail if resource and mode is removed', () => {
        const props = {
            mode: 'removed',
            loading: false,
            resource: 'resource',
            p: { t: () => {} },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        expect(wrapper.find(RemovedDetail).length).toEqual(1);
        expect(wrapper.find(Detail).length).toEqual(0);
    });

    it('should display back to list in link if no datasetTitle', () => {
        const props = {
            loading: false,
            resource: 'resource',
            datasetTitle: null,
            p: { t: v => v },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        const link = wrapper.find(Link).at(0);
        expect(link.children().at(1).text()).toBe('back_to_list');
    });

    it('should display datasetTitle in link', () => {
        const props = {
            loading: false,
            resource: 'resource',
            datasetTitleKey: 'dataset_title',
            characteristics: { dataset_title: 'dataset title' },
            p: { t: v => v },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        const link = wrapper.find(Link).at(0);
        expect(link.children().at(1).text()).toBe('dataset title');
    });

    it('should display resource[titleKey] if titleKey is set', () => {
        const props = {
            loading: false,
            resource: {
                titleKey: 'resource title',
            },
            titleKey: 'titleKey',
            p: { t: v => v },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        const h1 = wrapper.find('h1').at(0);
        expect(h1.text()).toContain('resource title');
    });

    it('should display resource.uri if titleKey is not set', () => {
        const props = {
            loading: false,
            resource: {
                titleKey: 'resource title',
                uri: 'resource uri',
            },
            titleKey: null,
            p: { t: v => v },
        };

        const wrapper = shallow(<ResourceComponent
            {...props}
        />);
        const h1 = wrapper.find('h1').at(0);
        expect(h1.text()).toContain('resource uri');
    });
});
