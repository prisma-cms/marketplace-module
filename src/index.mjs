
import Module from "./modules";

import URI from "urijs";

/**
 * Получаем проект из запроса.
 * Это нужно для определения того, к какому конкретному проекту относится запрос
 */
export const getProjectFromRequest = async function (ctx) {

  // console.log("ctx", ctx.request.headers);

  const {
    request: {
      headers: {
        origin,
      },
    },
    db,
  } = ctx;

  if (!origin) {
    return;
  }

  const uri = new URI(origin);

  const domain = uri.hostname();

  if (!domain) {
    return;
  }

  // console.log("ctx domain", domain);

  return await db.query.project({
    where: {
      domain,
    },
  });
}


export default Module
