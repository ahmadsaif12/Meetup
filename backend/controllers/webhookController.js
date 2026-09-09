import { verifyWebhook } from "@clerk/express/webhooks"
import { sql } from "../config/db.js";

export const handleClerkWebhook = async(req,res)=>{
    try{
      const evt = await verifyWebhook(req)
      const eventType = evt.type;
      const data = evt.data;

      //switch case for user created,updated and deleted
      switch(eventType){
        case "user.created":{
            const userId = data.id;
            const primaryEmail = data.email_addresses?.[0]?.email_address || "";
            const name = `${data.first_name || "user"} ${data.last_name || ""}`;
            const image = data.image_url || "";
            const plan = "free"

            await sql `
            insert into users(id,name,email,image,plan) values(${userId},${name},${primaryEmail},${image},${plan}) on conflict (email) do update set
            id = excluded.id,
            name = excluded.name,
            image = excluded.image,
            plan = excluded.plan,
            updated_at = NOW();
            `
            break;
        }

        case "user.updated":{
            const userId = data.id;
            const primaryEmail = data.email_addresses?.[0]?.email_address || "";
            const name = `${data.first_name || "user"} ${data.last_name || ""}`;
            const image = data.image_url || "";

            await sql `
            update users set
            name = ${name},
            email = ${primaryEmail},
            image = ${image},
            updated_at = NOW()
            where id = ${userId};
            `
            break;
        }
        
        case "user.deleted":{
            const userId = data.id;
            if(userId){
                await sql `delete from users where id = ${userId}`;
            }
            break;
        }
        default :
        console.log(`unhandled clerk webhook event type : ${eventType}`)
      }

      res.status(200).json({success:true});
    }catch(error){
      console.error(error);
      res.status(400).json({success:false});
    }
}

