

import PrismaProcessor from "@prisma-cms/prisma-processor";
import PrismaModule from "@prisma-cms/prisma-module";

import chalk from "chalk";

class TemplateProcessor extends PrismaProcessor {


  constructor(props) {

    super(props);

    this.objectType = "Template";

    this.private = true;

  }


  async create(objectType, args, info) {

    const {
      db,
    } = this.ctx;

    let {
      data: {
        props = {},
        components = [],
        Parent,
        ...data
      },
      ...otherArgs
    } = args;


    const {
      id: currentUserId,
    } = await this.getUser(true);


    /**
     * Если указан родитель, проверяем, чтобы не было еще ни одного корневого шаблона
     */
    if (!Parent || !Parent.connect) {

      const exists = await db.exists.Template({
        Parent: null,
        component: "Page",
      });

      if (exists) {
        this.addError("Can not create more than one root template");
      }

    }
    else {

      const parent = await db.query.template({
        where: Parent.connect,
      });

      if (!parent) {
        this.addError("Can not get parent template");
      }

    }


    Object.assign(data, {
      props,
      components,
      Parent,
      CreatedBy: {
        connect: {
          id: currentUserId,
        },
      },
    });


    return super.create(objectType, {
      data,
      ...otherArgs,
    }, info);

  }


  async update(objectType, args, info) {

    const {
      db,
    } = this.ctx;

    let {
      data: {
        Parent,
        component,
        ...data
      },
      ...otherArgs
    } = args;


    /**
     * Запрещаем любые манипуляции с родителем
     */
    if (Parent !== undefined) {

      this.addError("Parent changing not allowed");

    }

    /**
     * Запрещаем любые манипуляции с компонентом
     */
    if (component !== undefined) {

      this.addError("component changing not allowed");

    }


    Object.assign(data, {
    });


    return super.update(objectType, {
      data,
      ...otherArgs,
    }, info);

  }


  async mutate(objectType, args, into) {

    let {
      data: propsData,
    } = args;

    const {
      props,
      components,
      ...data
    } = propsData || {};
    

    if (props !== undefined && !props) {
      props = {};
    }

    if (components !== undefined && !components) {
      components = [];
    }


    Object.assign(data, {
      props,
      components,
    });


    Object.assign(args, {
      data,
    });

    return super.mutate(objectType, args);
  }

}




class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    // this.mergeModules([ 
    // ]);


    this.TemplateResponse = {
      data: (source, args, ctx, info) => {

        const {
          id,
        } = source && source.data || {};

        return id ? ctx.db.query.template({
          where: {
            id,
          },
        }, info) : null;

      },
    }

  }



  getResolvers() {


    return {
      Query: {
        template: this.template.bind(this),
        templates: this.templates.bind(this),
        templatesConnection: this.templatesConnection.bind(this),
      },
      Mutation: {
        createTemplateProcessor: this.createTemplateProcessor.bind(this),
        updateTemplateProcessor: this.updateTemplateProcessor.bind(this),
        deleteTemplate: this.deleteTemplate.bind(this),
        // deleteManyTemplates: this.deleteManyTemplates.bind(this),
      },
      Subscription: {
        template: {
          subscribe: async (parent, args, ctx, info) => {

            return ctx.db.subscription.template(args, info)
          },
        },
      },
      TemplateResponse: this.TemplateResponse,
    }

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }

  getProcessorClass() {
    return TemplateProcessor;
  }


  templates(source, args, ctx, info) {
    return ctx.db.query.templates({}, info);
  }

  template(source, args, ctx, info) {
    return ctx.db.query.template({}, info);
  }

  templatesConnection(source, args, ctx, info) {
    return ctx.db.query.templatesConnection({}, info);
  }


  createTemplateProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).createWithResponse("Template", args, info);
  }

  updateTemplateProcessor(source, args, ctx, info) {

    return this.getProcessor(ctx).updateWithResponse("Template", args, info);
  }


  deleteTemplate(source, args, ctx, info) {
    return this.getProcessor(ctx).delete("Template", args, info);
  }


  // deleteManyTemplates(source, args, ctx, info) {
  //   return this.getProcessor(ctx).deleteMany("Template", args, info);
  // }

}


export default Module;
