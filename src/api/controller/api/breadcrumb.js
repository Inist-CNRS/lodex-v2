import jsonConfig from '../../../../config.json';

export const getBreadcrumb = () => jsonConfig.front.breadcrumb;

export default async ctx => {
    ctx.body = {
        breadcrumb: getBreadcrumb(),
    };
};
