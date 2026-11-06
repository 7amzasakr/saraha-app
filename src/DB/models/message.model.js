import { Schema ,Types, model} from "mongoose"






const messageScema = new Schema(
    {
        content :{
            type :String,
            require : function (){
                this.images?.length?false:true
            },
            images:{
                type : [String]
            },
            to:{
                type :Types.ObjectId,
                required:true,
                ref:"User"
            }

        }
    },{
        timestamps : true,
        strict  :true,
        strictQuery  :true,
        optimisticConcurrency : true,
        toJSON: {
            virtuals : true,
            getters : true,
            transform(doc,ret){
                delete ret.id
                return ret
            }
        },
        toObject : {
            virtuals  : true,
            getters  :true,
            transform(doc,ret){
                delete ret.id
                return ret
            }
    }
}

)

export const messageModel = model("Message",messageScema)