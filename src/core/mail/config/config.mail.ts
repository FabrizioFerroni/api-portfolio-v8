import Handlebars from 'handlebars';
import * as ejs from 'ejs';
import { fileToString } from '../utils/fileToString';
import { configApp } from '@/config/app/config.app';

export const templateToString = function (
  plantilla: string = '',
  data: Record<string, unknown> = {},
): string {
  try {
    let path = '';

    if (configApp().env === 'production' || configApp().env === 'staging') {
      path = process.cwd() + `/dist/core/mail/pages/${plantilla}.html`;
    } else {
      path = process.cwd() + `/src/core/mail/pages/${plantilla}.html`;
    }

    const html: string = fileToString(path);

    const rest_html: string = ejs.render(html, data);

    const template: HandlebarsTemplateDelegate = Handlebars.compile(rest_html);

    const htmlToString: string = template({ op: true });

    return htmlToString;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Error al leer o procesar la plantilla HTML: ${message}`);
  }
};
