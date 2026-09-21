module.exports = function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const supabaseUrl=process.env.SUPABASE_URL||'';
  const supabasePublishableKey=process.env.SUPABASE_PUBLISHABLE_KEY||'';
  res.status(200).json({
    enabled:Boolean(supabaseUrl&&supabasePublishableKey),
    supabaseUrl,
    supabasePublishableKey
  });
};
