import { createClient } from '@supabase/supabase-js';

const params = {
  "development": {
    url: "https://fottxtergaqqiohzyoud.supabase.co",
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdHR4dGVyZ2FxcWlvaHp5b3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MTY1MDEsImV4cCI6MjAyMjM5MjUwMX0.ST6MG1cix0KJVG0asEBgQZsxDAVA9RrmMDRam-V3DfA'
  },
  "production": {
    url: "https://ygvmxyqlnggbviwnhjjx.supabase.co",
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlndm14eXFsbmdnYnZpd25oamp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI2NjM3MDksImV4cCI6MjAwODIzOTcwOX0.6WZKWt1dNaS2S4bU4YqlpVGwWy19EWZojVw8oJv9OX0'
  }
}

export const supabase = createClient(params[process.env.NODE_ENV].url, params[process.env.NODE_ENV].key);
