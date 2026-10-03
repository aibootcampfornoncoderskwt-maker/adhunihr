// Role suggestions for the hiring brief builder: the "Roles we fill" lists from the industry pages, grouped by industry.
import {industries} from './site';

export const briefRoleGroups=industries.map(item=>({slug:item.slug,title:item.title,roles:[...item.roles]}));
