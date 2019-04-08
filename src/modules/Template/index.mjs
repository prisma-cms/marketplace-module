

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


    let {
      data: {
        ...data
      },
      ...otherArgs
    } = args;


    const {
      id: currentUserId,
    } = await this.getUser(true);


    Object.assign(data, {
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


  async mutate(objectType, args, into) {

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
        deleteManyTemplates: this.deleteManyTemplates.bind(this),
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
    return ctx.db.mutation.deleteTemplate({}, info);
  }


  deleteManyTemplates(source, args, ctx, info) {
    return ctx.db.mutation.deleteManyTemplates({}, info);
  }

}


export default Module;
