import Handlebars from 'handlebars';
import * as ejs from 'ejs';
import { fileToString } from '../utils/fileToString';

export const templateToString = function (
  plantilla: string = '',
  data: Record<string, unknown> = {},
): string {
  try {
    const path: string =
      process.cwd() + `/src/core/mail/pages/${plantilla}.html`;

    console.log(path);

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
